var express = require('express');
var router = express.Router();

const usersModel = require('../models/users');
const postsModel = require('../models/posts')

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
    const path = `./public/uploads/profiles`
    fs.mkdirSync(path,{recursive: true })
    cb(null,path)
  },
  filename:function(req,file,cb){
    // console.log("file is here in storage=====>",file)
    const fileExtension = path.extname(file.originalname)
    const fileNameArray = file.originalname.split(".")
    const fileName = fileNameArray[0];
    cb(null, fileName+fileExtension )
  }
})



const upload = multer({storage:storage})


// get route to render the  profile of user logged in
router.get('/',async function(req,res,next){
    try{
      let loginUser = await usersModel.findOne({_id:req.user._id}).lean(true); 
      const updatedUser = await usersModel.findOne({_id:req.user._id}).lean();
      console.log(updatedUser,"====================>:")
      console.log(req.user,"====================>:")
      res.render('profile/index',{title:'user-home' , layout:'users-layout'  , user:updatedUser , userLogged:loginUser})
    }
    catch(error){
      console.log(error);
      res.send(404)
    }
  })
  
//put route for user's profile updation process in database
router.post('/update',upload.single('profilePicture'),async function(req,res,next){
    try{
      console.log(req.body,req.file,req.user._id)
      if(req.file){
        req.body.profileImagePath = `/uploads/profiles/${req.file.originalname}`
      }
      // req.body.profileImagePath = "/uploads/profiles/default.jpg";
      await usersModel.updateOne({_id:req.user._id},{$set:req.body})
      res.redirect('/profile/')
    }
    catch(error){
      console.log(error);
      res.render('error',{message:'error in rendering profile page', status:404})
    }
  })





module.exports = router;
