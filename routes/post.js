var express = require("express");
var router = express.Router();
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const usersModel = require("../models/users");
const postsModel = require("../models/posts");
const fs = require("fs");
// import multer
const multer = require("multer");
// import path for extname of file[express inbuilt]
const path = require("path");

// 1.upload by destination method
// const upload = multer({dest:'./public/uploads'})
// 2.upload by storage method
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("-----innner destination-------------------------");
    const id = req.user._id;
    const path = `./public/uploads/posts`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    console.log("-----innner filename-------------------------");
    // console.log("file is here in storage=====>",file)
    const fileExtension = path.extname(file.originalname);
    const fileNameArray = file.originalname.split(".");
    const fileName = fileNameArray[0];
    cb(null, fileName + fileExtension);
  },
});

const upload = multer({ storage: storage });

// get route to render the create-post page
router.get("/", async function (req, res, next) {
  try {
    let userPipeline = []
    userPipeline.push({
      $match:{
        _id:new ObjectId(req.user._id),
      }
    })
    userPipeline.push({
      $lookup:{
        from:'notifications',
              let:{'id':'$_id'},
              pipeline:[
                {
                  $sort:{
                    createdOn:-01
                  }
                },
                {
                $match:{
                  $expr:{
                    $eq:['$_to','$$id']
                  },
                  isSeen:false
                }
              }],
              as:'notifications'
            }
          })
     userPipeline.push({
      $project:{
          lastName:1,
          firstName:1,
          notifications:1,
          totalNotifications:{$size:'$notifications'},
          profileImagePath:1
          }
      }) 
      console.log(JSON.stringify(userPipeline,null,3))
      let loginUser = await usersModel.aggregate(userPipeline)
      if(req.query._id){
      await postsModel.updateOne(req.query,{$set:{'isArchived':false}})
      return res.redirect('/post/archived-posts')
    }
    res.render("create-post/index", {
      title: "user-home",
      layout: "users-layout",
      userLogged:loginUser[0]
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: "error in redndering create-post page",
      status: 404,
    });
  }
});

// post route for user to create a post
router.post("/", upload.single("postImage"), async function (req, res, next) {
  try {
    console.log("-----------------inside  post route for create post");

    let postDetails = req.body;
    // console.log('===================================>',req.user)
    // console.log(req.body, req.file)
    postDetails._user = `${req.user._id}`;
    if (req.file) {
      postDetails.imageName = req.file.originalname;
      postDetails.imagePath = `/uploads/posts/${req.file.originalname}`;
    }
    console.log(postDetails);
    await postsModel.create(postDetails);
    res.redirect("/timeline/");
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: "error in sending post-details",
      status: 404,
    });
  }
});

// post route to archive post

router.get("/archive/:postId", async function (req, res, next) {
  try {
    console.log(req.params.postId);
    await postsModel.updateOne(
      { _id: req.params.postId },
      { $set: { isArchived: true } }
    );
    res.send("ok");
  } catch (error) {
    console.log(error);
    res.send({
      type: "error",
      message: "error while archiving post",
      status: 404,
    });
  }
});

// get route to show archived posts

router.get("/archived-posts/", async function (req, res, next) {
  try {
    let userPipeline = []
    userPipeline.push({
      $match:{
        _id:new ObjectId(req.user._id),
      }
    })
    userPipeline.push({
      $lookup:{
        from:'notifications',
              let:{'id':'$_id'},
              pipeline:[
                {
                  $sort:{
                    createdOn:-01
                  }
                },
                {
                $match:{
                  $expr:{
                    $eq:['$_to','$$id']
                  },
                  isSeen:false
                }
              }],
              as:'notifications'
            }
          })
     userPipeline.push({
      $project:{
          lastName:1,
          firstName:1,
          notifications:1,
          totalNotifications:{$size:'$notifications'},
          profileImagePath:1
          }
      }) 
      console.log(JSON.stringify(userPipeline,null,3))
      let loginUser = await usersModel.aggregate(userPipeline)
    console.log('---------archived called to show  list------------',req.user._id)
    let userId = req.user._id
    let archivedPosts = await postsModel.aggregate([
        {
          $match: {
            _user: new ObjectId(userId),
            'isArchived':true
          },
        },
        {
          $lookup: {
            from: "users",
            let: { archived: "$_user" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$archived"],
                  },
                },
              },
            ],
            as: "user",
          },
        },
      ]);
    console.log(archivedPosts.length);
    // res.send('ok')
    if(!archivedPosts.length){
      res.render('no-post-found/index',{
        title: "user-home",
        layout: "users-layout",
        userLogged: loginUser[0],
        whatNotFound:'No Archived-Post Found',
        postOrUser:'post'
      })
    }
    res.render("archived-posts/index", {
      title: "user-home",
      layout: "users-layout",
      posts: archivedPosts,
      userLogged:loginUser[0]
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: "error in redndering archived post ",
      status: 404,
    });
  }
});

module.exports = router;
