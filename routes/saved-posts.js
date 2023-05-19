var express = require("express");
var router = express.Router();
const usersModel = require("../models/users");
const postsModel = require("../models/posts");
const SavedPostsModel = require("../models/savedPosts");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const notificationsModel = require("../models/notifications")
const toastr = require('toastr')

// get route to render the saved posts page
router.get("/", async function (req, res, next) {
  try {
    const loginUser = await usersModel.findOne({_id:req.user._id}).lean(true); 

    let userId = req.user._id;
    // console.log(userId)
    let allSavedposts = await SavedPostsModel.aggregate([
      {
        $match:{
          savedBy:new ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: "users",
          let: { userid: "$savedBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userid"],
                },
              },
            },
          ],
          as: "savedBy",
        },
      },
      {
        $lookup: {
          from: "posts",
          let: { postid: "$_post" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$postid"],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                let: { userId: "$_user" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$userId"],
                      },
                    },
                  },
                ],
                as: "postBy",
              },
            },
            {
              $project: {
                postTitle: 1,
                postDescription: 1,
                imagePath: 1,
                postBy: { $arrayElemAt: ["$postBy", 0] },
              },
            },
          ],
          as: "post",
        },
      },
      {
        $project: {
          savedBy: { $arrayElemAt: ["$savedBy", 0] },
          post: { $arrayElemAt: ["$post", 0] },
        },
      },
    ]);
    console.log(allSavedposts);
    res.render("saved-posts/index", {
      title: "user-home",
      layout: "users-layout",
      savedPosts: allSavedposts,
      userLogged:loginUser
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: "error in redndering saved-posts",
      status: 404,
    });
  }
});

// save the post

router.post("/save", async function (req, res, next) {
  
  try {
    console.log(req.user._id);
    console.log("-------------->>>>>>",req.body)
    let notificationDetails = {
      _from:req.user._id,
      _to:req.body.postBy,
      title:`${req.user.firstName} ${req.user.lastName} saved post`,
      type:'save',
      isSeen:false,
    }
    await notificationsModel.create(notificationDetails)
    await SavedPostsModel.create(req.body);
    res.send("ok");
  } catch (error) {
    console.log(error);
    res.send({
      type: "error",
      message: "error in saving post",
      status: 404,
    });
  }
});

// delete router to unsave post

router.delete("/delete", async function (req, res, next) {
  try {
    await SavedPostsModel.deleteOne({savedBy:req.body.savedBy,_post:req.body._post});
    res.send({
      type: "success",
      message: "post removed from save",
      status: 200,
    })
  } catch (error) {
    console.log(error);
    res.send({
      type: "error",
      message: "error while unsaving post",
      status: 404,
    });
  }
});

module.exports = router;
