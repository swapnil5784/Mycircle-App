var express = require('express');
var router = express.Router();
const usersModel = require('../models/users');
const postsModel = require('../models/posts')
const cronDataModel = require('../models/cronData')
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
          },
          {
            $sort:{
              createdOn:-1
            }
          }
           
        ]);
        // ------------------------------------for cron Data-------------------------------------------
      // console.log(allPosts);
        let lookup ={
          $lookup:{
            from:'users',
            let:{'userId':'$_user'},
            pipeline:[
              {
                $match:{
                  $expr:{
                    $eq:['$_id','$$userId']
                  }
                }
              }
            ],
            as:'user'
          }
        }
        let project = {
          $project:{
            user:{$arrayElemAt:['$user',0]},
            createdPosts:1,
            savedPosts:1,
            savedByothers:1
          }
        }
        let addFields ={
          $addFields:{'fullname':{$concat:['$user.firstName',' ','$user.lastName']},'email':'$user.userEmail'}
        }
        let sort = {
          $sort:{
            createdOn:-1
          }
        }
        let match ={
          $match:{

          }
        }

        // filter user by search
        if(req.query.user){
          console.log('---------------------------->> search fr user',req.query.user)
          match={
            $match:{
              $or:[
              {fullname:{$regex:`${req.query.user}` , $options:'i'}},
              {email:{$regex:`${req.query.user}` , $options:'i'}}]
            }
          }
        }

        // doubt here 
    
          console.log(req.query)
          // for fullname sorting
          if(req.query.sort == 'fullname'){
            if(req.query.order == 'desc'){
              console.log('inside desc---------------------->>')
              sort = {
                $sort:{
                  fullname:-1
                }
              }
            }
            else{
              console.log('inside asc---------------------->>')
              sort = {
                $sort:{
                  fullname:1
                }
              }
            }
          }
          // for email sorting
          if(req.query.sort == 'email'){
            if(req.query.order == 'desc'){
              sort = {
                $sort:{
                  email:-1
                }
              }
            }
            else{
              sort = {
                $sort:{
                  email:1
                }
              }
            }
          }
          if(req.query.sort == 'savedPosts'){
            if(req.query.order == 'desc'){
              sort = {
                $sort:{
                  savedPosts:-1
                }
              }
            }
            else{
              sort = {
                $sort:{
                  savedPosts:1
                }
              }
            }
          }

          if(req.query.sort == 'createdPosts'){
            if(req.query.order == 'desc'){
              sort = {
                $sort:{
                  createdPosts:-1
                }
              }
            }
            else{
              sort = {
                $sort:{
                  createdPosts:1
                }
              }
            }
          }

          if(req.query.sort == 'savedByothers'){
            if(req.query.order == 'desc'){
              sort = {
                $sort:{
                  savedByothers:-1
                }
              }
            }
            else{
              sort = {
                $sort:{
                  savedByothers:1
                }
              }
            }
          }
          
        console.log(sort)
      let pipeline =[]
      pipeline.push(lookup,project,addFields,match,sort)
      console.log(JSON.stringify(pipeline,null,3))
      let cronUserData =  await cronDataModel.aggregate(pipeline)
      let totalData ={
        savedByothers:0,
        createdPosts:0,
        savedPosts:0
      }
      for (const user of cronUserData) {
        totalData.savedByothers+=user.savedByothers;
        totalData.createdPosts+=user.createdPosts;
        totalData.savedPosts+=user.savedPosts;
      }
      totalData.users = (await usersModel.find({})).length
      console.log(totalData)
      // console.log(cronUserData)

      // console.log("--------------------------",cronUserData)
      res.render('report/index',{title:'report' , layout:'users-layout',total:totalData ,userReport:cronUserData, users:users, posts:allPosts , userLogged:loginUser})
    }
    catch(error){
      console.log(error);
      res.render('error',{message:'error in redndering report page', status:404})
    }
  })
  

module.exports = router;
