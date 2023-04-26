var express = require("express");
var router = express.Router();
const usersModel = require("../models/users");
const postsModel = require("../models/posts");
const passport = require("passport");
const LocalStratagy = require("passport-local").Strategy;

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
    let allPostsWithUsername = await postsModel.aggregate([
      {
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
      },
      {
        $project: {
          postTitle: 1,
          postDescription: 1,
          imageName: 1,
          imagePath: 1,
          createdOn: 1,
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      {
        $sort: {
          createdOn: -1,
        },
      },
    ]);
    res.render("landing-page/index", {
      title: "My circle",
      posts: allPostsWithUsername,
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
    let userDetails = req.body;
    // console.log(userDetails)
    await usersModel.create(userDetails);
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
    console.log(allPostsWithUsername);
    res.render("landing-page/index", {
      title: "My circle",
      posts: allPostsWithUsername,
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

module.exports = router;
