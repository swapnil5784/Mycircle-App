var express = require("express");
var router = express.Router();
const usersModel = require("../models/users");
const postsModel = require("../models/posts");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const passport = require("passport");
const LocalStratagy = require("passport-local").Strategy;
// 1.import node mailer
var nodemailer = require('nodemailer');


/* GET home page. */

// passport local stratagy function function
passport.use(
  new LocalStratagy(
    {
      usernameField: "userEmail",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function (req, userEmail, password, done) {
      //find user in db
      usersModel
        .findOne(
          {
            userEmail: {
              $regex: "^" + userEmail + "$",
              $options: "i",
            },
            password: password,
          },
          {
            _id: 1,
            firstName: 1,
            lastName: 1,
            userEmail: 1,
            password: 1,
            gender: 1,
          }
        )
        .then(async function (user) {
          if (!user) {
            console.log("--------------------then");
            console.log(user);

            return done(null, false, {
              message: "enter valid details",
            });
          } else {
            console.log(user);
            return done(null, user);
          }
        })
        .catch(function (err) {
          console.log(err, "error");
          done(null, false, {
            message: "enter valid details",
          });
        });
    }
  )
);

// serializeUser

passport.serializeUser(function (user, done) {
  try {
    console.log("---------serializeUser-------");
    return done(null, user);
  } catch (err) {
    console.log(err);
  }
});

// deserializeUser

passport.deserializeUser(function (user, done) {
  try {
    console.log("---------deserializeUser-------");
    return done(null, user);
  } catch (err) {
    Console.log(err);
  }
});
// post partial
router.get('/postPartial',function(req,res,next){
  res.render('partials/postPartial')
})

// get route to send partial for post modal in ajax

router.get("/edit/:postId", async function (req, res, next) {
  try {
    console.log(req.params.postId);
    let postDetails = await postsModel
      .findOne({ _id: req.params.postId })
      .lean(true);
    console.log(postDetails);
    res.render("partials/editModal", { post: postDetails, layout: false });
  } catch (error) {
    console.log(error);
    res.send({
      type: "error",
      messsage: "error while rendering partial of post-edit modal",
      status: 404,
    });
  }
});

// get route to render the landing page for not-logged in users
router.get("/", async function (req, res, next) {
  try {
    let totalPosts = await postsModel.find({})
    let postPerPagination = 4 ;
    let pipeline =[]
    let lookupOne = {
      $lookup: {
        from: "users",
        let: { posts: "$_user" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$posts"],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
            },
          },
        ],
        as: "user",
      },
    }
    let project = {
      $project: {
        postTitle: 1,
        postDescription: 1,
        imageName: 1,
        imagePath: 1,
        comments:{$size:'$comments'},
        createdOn: 1,
        user: { $arrayElemAt: ["$user", 0] },
      },
    }
    let sort = {
      $sort: {
        createdOn: -1,
      },
    }
    let limit ={
      $limit:4
    }
    let skip ={
      $skip:0
    }
    // for pagination
    let page = parseInt(req.query.page)
    if(req.query.page){
      skip ={
        $skip:postPerPagination*(page-1)
      }
      limit ={
        $limit:postPerPagination*page
      }
    }

    let lookupTwo = {
      $lookup: {
        from: "comments",
        let: { comment: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_post", "$$comment"],
              },
              isDeleted:false
            },
          }
        ],
        as: "comments",
      },
    }

    

    pipeline.push(limit,skip,sort,lookupOne,lookupTwo,project)
    // console.log(JSON.stringify(pipeline,null,3))
    let allPostsWithUsername = await postsModel.aggregate(pipeline);
    console.log(allPostsWithUsername)
    let noOfPosts = totalPosts.length;

    let needPagination = noOfPosts/4;
    console.log(Math.floor(needPagination))
    let pageArray = []
    for (let i = 1; i <= Math.floor(needPagination); i++) {
      pageArray.push(i)
    }
    res.render("landing-page/index", {
      title: "My circle",
      posts: allPostsWithUsername,
      pagination:pageArray
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: "error in redndering landing page after login ",
      status: 404,
    });
  }
});

// get route for redndering signin page
router.get("/signup", function (req, res, next) {
  try {
    res.render("landing-page/signup", { title: "signup" });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: "error in redndering signup page",
      status: 404,
    });
  }
});

// get route to render login page
router.get("/login", function (req, res, next) {
  try {
    res.render("landing-page/login", { title: "login" });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: "error in redndering login page",
      status: 404,
    });
  }
});

// post route to create users in database
router.post("/signup", async function (req, res, next) {
  try {
    req.body.profileImagePath = `/uploads/default/${req.body.gender}.png`;
    // let userDetails = req.body;
    console.log(req.body)
    await usersModel.create(userDetails);

    // 2.define transporter
      var transporter = nodemailer.createTransport({
        service:'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: true,
        auth: {
          user: 'swapnil.mycircle@gmail.com',
          pass: 'lxoldjnefineriei'
        }
      });
      console.log(transporter)
    // 3. mail option
    var mailOptions = {
      from: 'swapnil.mycircle@gmail.com',
      to:req.body.userEmail,
      subject: 'You have registered on Mycircle-App',
      text: 'registration completed'
    };
    // 4. send email with mail options
    await transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + req.body.userEmail);
      }
    });
    res.send({
      type: "success",
      message: "get userDetails sucessfully",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res.render("error", { message: "error in  signup process", status: 404 });
  }
});

// post route for user to login by localstrategy of passportJS

router.post("/login", async function (req, res, next) {
  console.log("---- login post success ----");
  try {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        return console.log(err);
      }
      // console.log(user);
      if (!user) {
        // console.log("---------------------- not user");
        return res.redirect("/login");
      }
      // console.log(user,"hiiiiiiiiiiiiiiiii");
      req.logIn(user, function (err) {
        if (err) {
          console.log(err, "hello");
        }
        return res.redirect("/timeline/");
      });
    })(req, res, next);
  } catch (error) {
    console.log(error, "in catch");
    res.render("error", {
      message: "error in redndering login page",
      status: 404,
    });
  }
});

// get route for user to logout application
router.get("/logout", async function (req, res, next) {
  console.log("logout router called !");
  await req.logout();
  return res.redirect("/");
});

// search posts on index page

router.get("/search", async function (req, res, next) {
  try {
    let pipeline = [];
    let match = {
      $match: {
        $or: [
          {
            postTitle: {
              $regex: `${req.query.aboutPost}`,
              $options: "i",
            },
          },
          {
            postDescription: {
              $regex: `${req.query.aboutPost}`,
              $options: "i",
            },
          },
        ],
      },
    };
    console.log('    match   ',match);
    console.log('    match   ',JSON.stringify(match,null,3));
    let firstLookup = {
      $lookup: {
        from: "users",
        let: { posts: "$_user" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$posts"],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
            },
          },
        ],
        as: "user",
      },
    };
    let project = {
      $project: {
        postTitle: 1,
        postDescription: 1,
        imageName: 1,
        imagePath: 1,
        createdOn: 1,
        user: { $arrayElemAt: ["$user", 0] },
      },
    };
    let sort = {
      $sort: {
        createdOn: -1,
      },
    };
    pipeline.push(match, firstLookup, project, sort);
    console.log(JSON.stringify(pipeline));
    // console.log(pipeline)
    let allPostsWithUsername = await postsModel.aggregate(pipeline);
    let noOfPosts = allPostsWithUsername.length;
    if(!noOfPosts){
      console.log('--------------0 posts-----------------------------')  
      res.render("noPost", {
        title: "My circle",
        
      });  
    }
    let needPagination = noOfPosts/4;
    let pageArray = []
    for (let i = 1; i <= Math.floor(needPagination); i++) {
      pageArray.push(i)
    }
    console.log(pageArray)
    // console.log(allPostsWithUsername);
    res.render("landing-page/index", {
      title: "My circle",
      posts: allPostsWithUsername,
      pagination:pageArray
    });
  } catch (error) {
    console.log(error);
    res.render("error", { message: "error at index page for search" });
  }
});

// route for email validation remote
router.get("/users/validate/email", async function (req, res, next) {
  try {
    console.log(req.query.userEmail);
    let isEnteredEmailExists = await usersModel.find({
      userEmail: req.query.userEmail,
    });
    console.log(isEnteredEmailExists.length);
    if (isEnteredEmailExists.length > 0) {
      console.log("------------exists email");
      return res.send(false);
    }
    return res.send(true);
  } catch (error) {
    console.log(error);
    res.render("error", { message: "error in email validation route" });
  }
});


// router to view post
router.get('/view-post/:postId',async function(req,res,next){
  try{
    console.log('-----------idhr aaya---------------------')
    let postDetails = await postsModel.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.postId),
        },
      },
      {
        $lookup: {
          from: "users",
          let: { user: "$_user" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$user"],
                },
              },
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
              },
            },
          ],
          as: "postOwner",
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { comment: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_post", "$$comment"],
                },
                isDeleted:false,
              },
            },
            {
              $lookup: {
                from: "users",
                let: { user: "$_commentBy" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$user"],
                      },
                    },
                  },
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                      profileImagePath: 1,
                    },
                  },
                ],
                as: "commentByDetails",
              }
            },
            {
              $sort:{
                createdOn:-1,
              }
            },
            {
              $project: {
                commentByDetails:{ $arrayElemAt: ["$commentByDetails", 0] },
                comment: 1,
                createdOn:1,
                _commentBy: 1,
              },
            },
            
          ],
          as: "comments",
        },
      },
      {
        $project: {
          postDescription: 1,
          postTitle: 1,
          imagePath: 1,
          createdOn: 1,
          updatedOn: 1,
          _user: 1,
          postOwner: { $arrayElemAt: ["$postOwner", 0] },
          comments: 1,
        },
      },
    ]);
    console.log(postDetails)

    res.render('postView/index',{post: postDetails[0]})

  }
  catch(error){
    console.log(error);
    res.render("error", { message: error, status: 404 });
  }
})
module.exports = router;
