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
const toastr = require("toastr");
const moment = require("moment");

router.get("/", async function (req, res, next) {
  try {
    let Users = await usersModel
      .find({ _id: { $nin: [new ObjectId(req.user._id)] } })
      .lean();
    console.log(Users);
    let userPipeline = [];
    userPipeline.push({
      $match: {
        _id: new ObjectId(req.user._id),
      },
    });
    userPipeline.push({
      $lookup: {
        from: "notifications",
        let: { id: "$_id" },
        pipeline: [
          {
            $sort: {
              createdOn: -1,
            },
          },
          {
            $match: {
              $expr: {
                $eq: ["$_to", "$$id"],
              },
              isSeen: false,
            },
          },
        ],
        as: "notifications",
      },
    });
    userPipeline.push({
      $project: {
        lastName: 1,
        firstName: 1,
        notifications: 1,
        totalNotifications: { $size: "$notifications" },
        profileImagePath: 1,
      },
    });
    console.log(JSON.stringify(userPipeline, null, 3));
    let loginUser = await usersModel.aggregate(userPipeline);
    let firstUser = Users[0];
    // console.log('fromMessage from socket client side ----------------------->',req.query.fromMessage)
    if (req.query.fromMessage) {
      firstUser = await usersModel
        .findOne({ _id: new ObjectId(req.query.fromMessage) })
        .lean(true);
    }
    if (req.query.userId) {
      firstUser = await usersModel
        .findOne({ _id: new ObjectId(req.query.userId) })
        .lean(true);
    }
    console.log(firstUser);

    // for message pagination

    let sender =  new ObjectId(req.user._id);
    let receiver = new ObjectId(firstUser._id);

    if(req.query.moreReceiver){
      receiver = new ObjectId(req.query.moreReceiver);
      firstUser = await usersModel
        .findOne({ _id: new ObjectId(req.query.moreReceiver) })
        .lean(true);
    }

    let pipeline = [];
    pipeline.push({
      $match: {
        $or: [
          {
            _sender:sender,
            _receiver: receiver ,
          },
          {
            _sender: receiver,
            _receiver: sender,
          },
        ],
      },
    });

    pipeline.push({
      $sort:{
        createdOn:-1
      }
    })

    let messageCounter = await chatMessagesModel.aggregate(pipeline);
    let totalMessages = messageCounter.length;
    let messageLimit = 4;
    let totalMessagePagination = Math.ceil(totalMessages / messageLimit);
    console.log(totalMessages, messageLimit, totalMessagePagination);

    let messagePagination = 1;

    if(req.query.pagination){
      messagePagination = req.query.pagination;
    }

    pipeline.push({
      $limit: (messagePagination)*messageLimit,
    });

    // pipeline.push({
    //   $skip: ( messagePagination - 1) * messageLimit,
    // });

    pipeline.push({
      $lookup: {
        from: "user",
        let: { user: "$_sender" },
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
        as: "sender",
      },
    });

    pipeline.push({
      $lookup: {
        from: "user",
        let: { user: "$_receiver" },
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
        as: "receiver",
      },
    });

    pipeline.push({
      $lookup:{
        from:'users',
        let:{'user':'$_sender'},
        pipeline:[
          {
            $match:{
              $expr:{
                $eq:['$_id','$$user']
              }
            }
          }
        ],
        as:'senderDetails'
      }
    })


    pipeline.push({
      $project: {
        _sender: 1,
        senderDetails:{$arrayElemAt:['$senderDetails',0]},
        _receiver: 1,
        message: 1,
        createdOn: 1,
        sender: { $arrayElemAt: ["$sender", 0] },
        receiver: { $arrayElemAt: ["$receiver", 0] },
      },
    });

    console.log(JSON.stringify(pipeline,null,3))

    let messages = await chatMessagesModel.aggregate(pipeline)
    console.log(JSON.stringify(messages,null,3))

    console.log(Users[0]);
    res.render("chat/index", {
      title: "Chat",
      layout: "users-layout",
      userLogged: loginUser[0],
      users: Users,
      firstUser: firstUser,
      messages: messages,
    });
  } catch (error) {
    console.log("error while rendering chat-page-------------->", error);
    res.render("error", { message: error, status: 404 });
  }
});

router.get("/message", async function (req, res, next) {
  try {
    console.log(req.query);
    let messageInDb = {
      _sender: req.query.sender,
      _receiver: req.query.receiver,
      message: req.query.message,
    };
    await chatMessagesModel.create(messageInDb);
    io.sockets.to(req.query.receiver).emit('responseToEventSendMessage',messageInDb)

    res.redirect(`/chat?fromMessage=${req.query.receiver}`);
  } catch (error) {
    console.log("error in chat messgage get route -------------->", error);
    res.render("error", { message: error, status: 404 });
  }
});

module.exports = router;
