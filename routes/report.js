var express = require('express');
var router = express.Router();
const usersModel = require('../models/users');
const postsModel = require('../models/posts')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


// get route to rednder the report page
router.get('/',async function(req,res,next){
    try{
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

      console.log('---------- inside report get route--------------------------')
      let users = await usersModel.aggregate([
        {
          $lookup: {
            from: "posts",
            let: { userPost: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_user", "$$userPost"],
                  },
                },
              },
            ],
            as: "posts",
          },
        },
        {
          $lookup: {
            from: "savedposts",
            let: { userPostSaved: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$savedBy", "$$userPostSaved"],
                  },
                },
              },
            ],
            as: "savedPosts",
          },
        },
        {
          $project:{
              posts:{$size:'$posts'},
              savedPosts:{$size:'$savedPosts'},
              firstName:1,
              lastName:1,
              userEmail:1,
              gender:1,
              profileImagePath:1,
              createdOn:1
          }
      },
      ])
      let allPosts = await postsModel.aggregate([
        {
            $lookup:{
                from:'users',
                let:{ 'userId':'$_user' },
                pipeline:[
                {
                    $match:{
                        $expr:{
                            $eq:[ '$_id' , '$$userId' ]
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
                 as:'user'
                }
            },
            {
              $project:{
                  user:{$arrayElemAt:['$user',0]},
                  postTitle:1,
                  postDescription:1,
                  createdOn:1,
                  imagePath:1,
                  updatedOn:1
              }
          }
           
        ]);
      // console.log(allPosts);
      res.render('report/index',{title:'Report' , layout:'users-layout' , users:users, posts:allPosts , userLogged:loginUser[0]})
    }
    catch(error){
      console.log(error);
      res.render('error',{message:'error in redndering report page', status:404})
    }
  })
  

module.exports = router;
