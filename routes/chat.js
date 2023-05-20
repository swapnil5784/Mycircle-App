// import packages
var express = require("express");
var router = express.Router();
const usersModel = require("../models/users");
const postsModel = require("../models/posts");
const commentsModel = require("../models/comments");
const notificationsModel = require("../models/notifications");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const fs = require("fs");
const toastr = require("toastr");
const moment = require("moment");

router.get("/", async function (req, res, next) {
  try {
    let Users = await usersModel.find({'_id':{ $nin :[ new ObjectId(req.user._id) ]  }}).lean()
    console.log(Users)
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
      let firstUser = Users[0];
      if(req.query.userId){
        firstUser = await usersModel.findOne({_id:new ObjectId(req.query.userId)}).lean(true)
      }    
    console.log(Users[0])
    res.render("chat/index", {
      title: "Chat",
      layout: "users-layout",
      userLogged: loginUser[0],
      users:Users,
      firstUser:firstUser
    });
  } catch (error) {
    console.log("error while rendering chat-page-------------->", error);
    res.render("error", { message: error, status: 404 });
  }
});


module.exports = router;
