var express = require('express');
var router = express.Router();
const usersModel = require('../models/users');
const postsModel = require('../models/posts')

// get route to rednder the report page
router.get('/',async function(req,res,next){
    try{
      const loginUser = await usersModel.findOne({_id:req.user._id}).lean(true); 

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
      res.render('report/index',{title:'report' , layout:'users-layout' , users:users, posts:allPosts , userLogged:loginUser})
    }
    catch(error){
      console.log(error);
      res.render('error',{message:'error in redndering report page', status:404})
    }
  })
  

module.exports = router;
