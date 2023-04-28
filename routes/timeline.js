var express = require("express");
var router = express.Router();
const usersModel = require("../models/users");
const postsModel = require("../models/posts");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const fs = require('fs');

// import multer
const multer = require('multer')
// import path for extname of file[express inbuilt]
const path =require('path')

// 1.upload by destination method
// const upload = multer({dest:'./public/uploads'})
// 2.upload by storage method
const storage =  multer.diskStorage({
  destination:function(req,file,cb){
    console.log("-----------------------------in destination---------------------")
    const id = req.user._id
    const path = `./public/uploads/posts`
    fs.mkdirSync(path,{recursive: true })
    cb(null,path)
  },
  filename:function(req,file,cb){
    console.log("-----------------------------in finename---------------------")
    // console.log("file is here in storage=====>",file)
    const fileExtension = path.extname(file.originalname)
    const fileNameArray = file.originalname.split(".")
    const fileName = fileNameArray[0];
    cb(null, fileName+fileExtension )
  }
})

const upload = multer({storage:storage})



// post route to update user's post details

router.post('/edit/post/:postId',upload.single('imageName'),async function(req,res,next){
  try{
    if(req.file){
      req.body.imageName = req.file.originalname;
      req.body.imagePath = `/uploads/posts/${req.file.originalname}`,
      console.log(req.body)
    }
    await postsModel.updateOne({_id:req.params.postId},{$set:req.body})
    res.redirect('/timeline/')
  }
  catch(error){
    console.log(error);
    res.render('error',{message:'error in post route for edit post details',status:404})
  }
})


router.get('/',async function(req,res,next){
  try{
      let loginUser = await usersModel.findOne({_id:req.user._id}).lean(true); 
      let pipeline=[]
      let match={
        $match:{
          isArchived:false
        }
      }
      let sort ={
        $sort:{
          createdOn:-1
        }
      }
      let limit = {
        $limit:4
      }
      let skip = {
        $skip:0
      }
      let lookup={
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
                profileImagePath:1
              },
            },
          ],
          as: "user",
        },
      }
      let project = {
        $project: {
          postTitle: 1,
          postDescription: 1,
          _user:1,
          imageName:1,
          imagePath:1,
          createdOn:1,
          user: { $arrayElemAt: ["$user", 0] },
        },
      }
      // if for pagination page in url
      if(req.query.page){
        let postLimit = 4;
        let paginationPage = parseInt(req.query.page)
        limit = {
          $limit:postLimit*paginationPage
        }
        skip = {
          $skip:postLimit*(paginationPage-1)
        }
      }

      // if sortByTitle in url
      if(req.query.sortByTitle){
        if(req.query.sortByTitle == 'asc'){
          sort = {
            $sort:{postTitle:1}
          }  
        }
        else{
            sort = {
            $sort:{postTitle:-1}
          }
        }
      }

      // if sortByDateTime in url
      if(req.query.sortByDateTime){
        if(req.query.sortByDateTime == 'desc'){
          sort ={
            $sort:{
              createdOn:1
            }
          }
        }
        else{
          sort ={
            $sort:{
              createdOn:-1
            }
          }
        }
      }

      //filtering posts if post(postType) in url and for aboutPst 
      if(req.query.post){
        console.log('-------------------------->>inside filter post if condition');
        console.log('req.query.post----------------------->',req.query.post)
        match={$match: {
          isArchived:false,
          $or:[
            {
              postTitle:{$regex:`${req.query.aboutPost}` ,$options:'i'}
            },
            {
              postDescription:{$regex:`${req.query.aboutPost}` ,$options:'i'}
            }
          ]
        }
      }
      switch(req.query.post) {
        case 'mine':
          console.log('-------------------------->>inside switch mine condition')
          match= {$match:{
            isArchived:false,
            $or:[
              {
                postTitle:{$regex:`${req.query.aboutPost}` ,$options:'i'}
              },
              {
                postDescription:{$regex:`${req.query.aboutPost}` ,$options:'i'}
              }
            ],
            $expr:{
              $eq:['$_user',new ObjectId(req.user._id)]
            }
          }
        }
          // match.$match.$expr = {
          //     $eq:['$_user',ObjectId(`${req.user._id}`)]
          // }
          break;
        case 'others':
          console.log('-------------------------->>inside others mine condition')
          match={$match:{
            isArchived:false,
            $or:[
              {
                postTitle:{$regex:`${req.query.aboutPost}` ,$options:'i'}
              },
              {
                postDescription:{$regex:`${req.query.aboutPost}` ,$options:'i'}
              }
            ],
            $expr:{
              $ne:['$_user',new ObjectId(req.user._id)]
            }
          }
        }
          // match.$match.$expr = {
          //   $ne:['$_user',ObjectId(`${req.user._id}`)]
          //   }
          break;
        default:
         console.log('in default post for all')
          break;
      }
      }
      
      // prepare pipeline
      pipeline.push(match,sort,limit,skip,lookup,project)
      let allPostsWithUsername = await postsModel.aggregate(pipeline)
      console.log(JSON.stringify(pipeline,null,3))
      // console.log(allPostsWithUsername)
      res.render("timeline/index", {
      title: "user-home",
      layout: "users-layout",
      posts:allPostsWithUsername,
      userLogged:loginUser
    });
  }
  catch(error){
    res.render('error',{message:error, status:404})
  }
})

// get route to render the landing page after login
// router.get("/", async function (req, res, next) {
//   try {
//     let loginUser = await usersModel.findOne({_id:req.user._id}).lean(true); 
//     console.log(loginUser)
//     let userId = req.user._id;
// // --------------------------------------------------------
//     // sort posts on title
//     if(req.query.sortTitle || req.query.sortDateTime ){
//       let pipeline = [];
// let match = {
//   $match:{
//     isArchived:false
//   }
// }

// let lookup={
//   $lookup: {
//     from: "users",
//     let: { posts: "$_user" },
//     pipeline: [
//       {
//         $match: {
//           $expr: {
//             $eq: ["$_id", "$$posts"],
//           },
//         },
//       },
//       {
//         $project: {
//           firstName: 1,
//           lastName: 1,
//           profileImagePath:1
//         },
//       },
//     ],
//     as: "user",
//   },
// }
// let project = {
//   $project: {
//     postTitle: 1,
//     postDescription: 1,
//     imageName:1,
//     imagePath:1,
//     createdOn:1,
//     user: { $arrayElemAt: ["$user", 0] },
//   },
// }
//       let sort ={ }
//       if(req.query.sortTitle){
//         if(req.query.sortTitle == 'asc'){
//           sort.$sort = {
//             postTitle:1
//             }
//         }
//         else{
//           sort.$sort = {
//             postTitle:-1
//             }
//         }
//       }
//       if(req.query.sortDateTime){
//         if(req.query.sortDateTime == 'asc'){
//           sort.$sort = {
//             createdOn:1
//             }
//         }
//         else{
//           sort.$sort = {
//             createdOn:-1
//             }
//         }
//       }
//       // console.log(sort)
//       pipeline.push(match,lookup,project,sort)
//       let postsSortedOnTitle = await postsModel.aggregate(pipeline)
//       // console.log(postsSortedOnTitle)
//       res.render("timeline/index", {
//         title: "user-home",
//         layout: "users-layout",
//         posts:postsSortedOnTitle,
//         userLogged:loginUser
//       });
      
//     }
//     // post list pagination after login
//     if(req.query.page && req.query.page != "undefined"){
//       console.log(req.query)
//       let postsForPagination = 4;
//       let postLimit = postsForPagination*parseInt(req.query.page);
//       let postSkip = postsForPagination*(parseInt(req.query.page)-1);
//       console.log(`limit is ${postLimit} and  skip is ${postSkip}`)
//       let paginationPosts = await postsModel.aggregate([
//         {
//           $sort:{
//               createdOn:-1
//               }
//           },
//           {
//           $limit:postLimit
//         },
//         {
//           $skip:postSkip
//         },
//         {
//           $match:{
//             isArchived:false
//           }
//         },
//         {
//           $lookup: {
//             from: "users",
//             let: { posts: "$_user" },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ["$_id", "$$posts"],
//                   },
//                 },
//               },
//               {
//                 $project: {
//                   firstName: 1,
//                   lastName: 1,
//                   profileImagePath:1
//                 },
//               },
//             ],
//             as: "user",
//           },
//         },
//         {
//           $project: {
//             postTitle: 1,
//             postDescription: 1,
//             imageName:1,
//             imagePath:1,
//             createdOn:1,
//             user: { $arrayElemAt: ["$user", 0] },
//           },
//         }
//       ])
//       console.log(paginationPosts)
//       return res.render("timeline/index", {
//         title: "user-home",
//         layout: "users-layout",
//         posts:paginationPosts,
//         userLogged:loginUser

//       });
//     }

// // --------------------------------------------------------
//     if(req.query.whichPosts || req.query.aboutPosts){
//       let aboutPosts = `${req.query.aboutPosts}`;
//       let pipeline = [];
//       let matchObject={};
//       if(req.query.whichPosts){
//         switch (req.query.whichPosts) {
//             case 'mine':
//                   matchObject={
//                     $match:{
//                          '_user':req.query.whichPosts
//                     }
//                 } 
//             break;
//             case 'others':
//                   matchObject={
//                       $match:{
//                           $expr:{
//                             $ne:[ '$_user', req.query.whichPosts ]
//                           }     
//                       }
//                   }
//             break;
//           default:
//                   console.log('for all no match')
//                   matchObject={
//                     $match:{
                     
//                     }
//                   }
//             break;
//         }
        
//       let lookup = {
//         $lookup: {
//           from: "users",
//           let: { posts: "$_user" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: ["$_id", "$$posts"],
//                 },
//               },
//             },
//             {
//               $project: {
//                 firstName: 1,
//                 lastName: 1,
//                 profileImagePath:1
//               },
//             },
//           ],
//           as: "user",
//         },
//       }
//       let project={
//         $project: {
//           postTitle: 1,
//           postDescription: 1,
//           imageName:1,
//           imagePath:1,
//           createdOn:1,
//           user: { $arrayElemAt: ["$user", 0] },
//         },
//       }
//       if(aboutPosts){
//         matchObject.$match.postTitle = { $regex: aboutPosts }; 
//         // matchObject.$match.postDescription = { $regex: aboutPosts };
//         pipeline.push(matchObject)
//       }
//       pipeline.push(lookup,project)
//     }
//       console.log(`postModel.aggregate(${JSON.stringify(pipeline,null,3)})`)
//       let filteredPosts = await postsModel.aggregate(pipeline)
//       console.log(filteredPosts)
//       console.log("inside search and filter")
//       return res.render("timeline/index", {
//       title: "user-home",
//       layout: "users-layout",
//       posts:filteredPosts,
//       userLogged:loginUser
//     });
//     }
//     console.log("inside render landing page normally")
//     console.log('req.user',req.user)
//     let allPostsWithUsername = await postsModel.aggregate([
//       {
//       $sort:{
//           createdOn:-1
//           }
//       },
//       {
//         $limit:4
//       },
//       {
//         $match:{
//           isArchived:false
//         }
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { posts: "$_user" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: ["$_id", "$$posts"],
//                 },
//               },
//             },
//             {
//               $project: {
//                 firstName: 1,
//                 lastName: 1,
//                 profileImagePath:1
//               },
//             },
//           ],
//           as: "user",
//         },
//       },
//       {
//         $project: {
//           postTitle: 1,
//           postDescription: 1,
//           imageName:1,
//           imagePath:1,
//           createdOn:1,
//           user: { $arrayElemAt: ["$user", 0] },
//         },
//       },
      
//     ])
//     // console.log(req.query,'-----in timeline---- default');
//     res.render("timeline/index", {
//       title: "user-home",
//       layout: "users-layout",
//       posts:allPostsWithUsername,
//       userLogged:loginUser
//     });
//   } catch (error) {
//     console.log(error);
//     res.render("error", {
//       message: "error in landing after login",
//       status: 404,
//     });
//   }
// });



module.exports = router;
