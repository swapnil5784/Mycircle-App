var express = require("express");
var router = express.Router();
const usersModel = require("../models/users");
const postsModel = require("../models/posts");
const moment = require('moment');
moment().format();
// get route for resndering all users in application
router.get("/", async function (req, res, next) {
  try {
    const loginUser = await usersModel.findOne({_id:req.user._id}).lean(true); 

    if(req.query.user){
      console.log(req.query.user)
      let usersMatched = await usersModel.aggregate([
        {
          $match:{
            $or:[
              {
                firstName:{$regex:`${req.query.user}` , $options:'i'}
              },
              {
                lastName:{$regex:`${req.query.user}` , $options:'i'}
              },
              {
                userEmail:{$regex:`${req.query.user}` , $options:'i'}
              }
              
            ]
          }
        },
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
      // console.log(usersMatched)
      return res.render("all-users/index", {
        title: "users",
        layout: "for-user",
        users:usersMatched,
        userLogged:loginUser

      });
    }
    let userPostCount = await usersModel.aggregate([
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
    ]);
    console.log("---------------------------------->>",moment().week())
    console.log(userPostCount);
    res.render("all-users/index", {
      title: "users",
      layout: "for-user",
      users:userPostCount,
      userLogged:loginUser

    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: "error in redndering all-users of application",
      status: 404,
    });
  }
});

// router.get("/validate/email", async function () {
//   try {
//     // console.log(req.params.field,"params-----------------------------------");
//     // console.log(req.query,"query====================")
//     // res.send(false);
//   } catch (error) {
//     console.log(error);
//   }
// });

// get route to send sorted users

router.get('/sort/:order',async function(req,res,next){
  try{
    const loginUser = await usersModel.findOne({_id:req.user._id}).lean(true); 

    let sortedUsers=[];
      if(req.params.order == 'ascending'){
        console.log("====================ascending")
         sortedUsers = await usersModel.aggregate([
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
    {
      $sort:{
        createdOn:1
      }
    }
    ])
         console.log(sortedUsers); 
                  
      }
      if(req.params.order == 'descending'){
        sortedUsers = await usersModel.aggregate([
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
    {
      $sort:{
        createdOn:-1
      }
    }
    ])
    console.log(sortedUsers);  
    
      }
      res.render("partials/sorted", {
        layout:false,
        users:sortedUsers,
        userLogged:loginUser
      });
  }
  catch(error){
    console.log(error);
    res.render('error',{message:'error in sorting post route',status:404})
  }
})

module.exports = router;
