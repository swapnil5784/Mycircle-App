// import packages
var express = require("express");
var router = express.Router();
const usersModel = require("../models/users");
const postsModel = require("../models/posts");
const commentsModel = require("../models/comments");
const notificationsModel = require("../models/notifications");
const chatMessagesModel = require("../models/chatMessages");
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
                    createdOn:-1
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
      // console.log('fromMessage from socket client side ----------------------->',req.query.fromMessage)
      if(req.query.fromMessage){
        firstUser = await usersModel.findOne({_id:new ObjectId(req.query.fromMessage)}).lean(true)
      }
      if(req.query.userId){
        firstUser = await usersModel.findOne({_id:new ObjectId(req.query.userId)}).lean(true)
      }  
      console.log(firstUser) 
      let messages = await chatMessagesModel.aggregate([
        {
          $match:{
            $or:[
              {
                _sender:new ObjectId(req.user._id),
                _receiver:new ObjectId(firstUser._id),
              },
              {
                _sender:new ObjectId(firstUser._id),
                _receiver:new ObjectId(req.user._id),

              }
            ]
          }
        },
        {
            $lookup:{
                from:"user",
                let:{"user":"$_sender"},
                pipeline:[{
                    $match:{
                        $expr:{
                            $eq:["$_id","$$user"]
                        }
                    }
                },
                {
                    $project:{
                        firstName:1,
                        lastName:1,
                        profileImagePath:1
                    }
                }
                ],
                as:"sender"
            }
        },
            {
            $lookup:{
                from:"user",
                let:{"user":"$_receiver"},
                pipeline:[{
                    $match:{
                        $expr:{
                            $eq:["$_id","$$user"]
                        }
                    }
                },
                {
                    $project:{
                        firstName:1,
                        lastName:1,
                        profileImagePath:1
                    }
                }
                ],
                as:"receiver"
            }
        },
        {
          $project:{
              _sender:1,
              _receiver:1,
              message:1,
              createdOn:1,
              sender:{$arrayElemAt:['$sender',0]},
              receiver:{$arrayElemAt:['$receiver',0]}
          }
      }
    ])
      console.log(JSON.stringify(messages,null,3))
    console.log(Users[0])
    res.render("chat/index", {
      title: "Chat",
      layout: "users-layout",
      userLogged: loginUser[0],
      users:Users,
      firstUser:firstUser,
      messages: messages
    });
  } catch (error) {
    console.log("error while rendering chat-page-------------->", error);
    res.render("error", { message: error, status: 404 });
  }
});

router.get('/message',async function(req,res,next){
  try{
    console.log(req.query)
    let messageInDb = {
      _sender: req.query.sender,
      _receiver: req.query.receiver,
      message: req.query.message
    } 
    await chatMessagesModel.create(messageInDb)
    res.redirect(`/chat?fromMessage=${req.query.receiver}`)

  }catch(error){
    console.log("error in chat messgage get route -------------->", error);
    res.render("error", { message: error, status: 404 });
  }
})

module.exports = router;
