var express = require('express');
var router = express.Router();

const usersModel = require('../models/users');
const postsModel = require('../models/posts');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const fs = require('fs');
// import multer
const multer = require('multer')
// import path for extname of file[express inbuilt]
const path = require('path')

// 1.upload by destination method
// const upload = multer({dest:'./public/uploads'})
// 2.upload by storage method
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    const path = `./public/uploads/profiles`
    fs.mkdirSync(path, { recursive: true })
    cb(null, path)
  },
  filename: function (req, file, cb) {
    // console.log("file is here in storage=====>",file)
    const fileExtension = path.extname(file.originalname)
    const fileNameArray = file.originalname.split(".")
    const fileName = fileNameArray[0];
    cb(null, fileName + fileExtension)
  }
})



const upload = multer({ storage: storage })


// get route to render the  profile of user logged in
router.get('/', async function (req, res, next) {
  try {
    let userPipeline = []
    userPipeline.push({
      $match: {
        _id: new ObjectId(req.user._id),
      }
    })
    userPipeline.push({
      $lookup: {
        from: 'notifications',
        let: { 'id': '$_id' },
        pipeline: [
          {
            $sort: {
              createdOn: -01
            }
          },
          {
            $match: {
              $expr: {
                $eq: ['$_to', '$$id']
              },
              isSeen: false
            }
          }],
        as: 'notifications'
      }
    })
    userPipeline.push({
      $project: {
        lastName: 1,
        firstName: 1,
        notifications: 1,
        totalNotifications: { $size: '$notifications' },
        profileImagePath: 1
      }
    })
    console.log(JSON.stringify(userPipeline, null, 3))
    let loginUser = await usersModel.aggregate(userPipeline)
    const updatedUser = await usersModel.findOne({ _id: req.user._id }).lean();
    console.log(updatedUser, "====================>:")
    console.log(req.user, "====================>:")
    res.render('profile/index', { title: 'user-home', layout: 'users-layout', user: updatedUser, userLogged: loginUser[0] })
  }
  catch (error) {
    console.log(error);
    res.send(404)
  }
})

//put route for user's profile updation process in database
router.post('/update', upload.single('profilePicture'), async function (req, res, next) {
  try {
    console.log(req.body, req.file, req.user._id)
    if (req.file) {
      req.body.profileImagePath = `/uploads/profiles/${req.file.originalname}`
    }
    // req.body.profileImagePath = "/uploads/profiles/default.jpg";
    await usersModel.updateOne({ _id: req.user._id }, { $set: req.body })
    res.redirect('/profile/')
  }
  catch (error) {
    console.log(error);
    res.render('error', { message: 'error in rendering profile page', status: 404 })
  }
})





module.exports = router;
