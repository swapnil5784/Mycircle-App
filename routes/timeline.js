var express = require("express");
var router = express.Router();
const usersModel = require("../models/users");
const postsModel = require("../models/posts");
const commentsModel = require("../models/comments");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const fs = require("fs");
const toastr = require('toastr')
const moment = require("moment");
// const app = require('../app')




// import multer
const multer = require("multer");

// import path for extname of file[express inbuilt]
const path = require("path");

// 1.upload by destination method
// const upload = multer({dest:'./public/uploads'})
// 2.upload by storage method
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(
      "-----------------------------in destination---------------------"
    );
    const id = req.user._id;
    const path = `./public/uploads/posts`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    console.log(
      "-----------------------------in finename---------------------"
    );
    // console.log("file is here in storage =====> ",file)
    const fileExtension = path.extname(file.originalname);
    const fileNameArray = file.originalname.split(".");
    const fileName = fileNameArray[0];
    cb(null, fileName + fileExtension);
  },
});

const upload = multer({ storage: storage });

// post route to update user's post details
router.post(
  "/edit/post/:postId",
  upload.single("imageName"),
  async function (req, res, next) {
    try {
      if (req.file) {
        req.body.imageName = req.file.originalname;
        (req.body.imagePath = `/uploads/posts/${req.file.originalname}`),
          console.log(req.body);
      }
      await postsModel.updateOne(
        { _id: req.params.postId },
        { $set: req.body }
      );
      res.redirect("/timeline/");
    } catch (error) {
      console.log(error);
      res.render("error", {
        message: "error in post route for edit post details",
        status: 404,
      });
    }
  }
);
// get route to add comment on post
router.get("/add-comment", async function (req, res, next) {
  try {
    if(req.query.removeComment){
      console.log('<---------------------------------> remove comments',req.query.commentId)
      await commentsModel.updateOne({_id:new ObjectId(req.query.commentId)},{$set:{isDeleted:true}});
      res.redirect(`/timeline/view-post/${req.query.postId}`);
    }else{
      console.log(req.query);
      await commentsModel.create(req.query);
      res.redirect(`/timeline/view-post/${req.query._post}`);
    }
  } catch (error) {
    console.log("error at post router to add comment on post", error);
    res.render("error", { message: error, status: 404 });
  }
});

// get route for view post details
router.get("/view-post/:postId", async function (req, res, next) {
  try {
    let loginUser = await usersModel.findOne({ _id: req.user._id }).lean(true);
    console.log(req.params.postId);
    let postDetails = await postsModel.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.postId),
        },
      },
      {
        $lookup: {
          from: "users",
          let: { user: "$_user" },
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
              },
            },
          ],
          as: "postOwner",
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { comment: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_post", "$$comment"],
                },
                isDeleted:false
              },
            },
            {
              $lookup: {
                from: "users",
                let: { user: "$_commentBy" },
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
                as: "commentByDetails",
              },
            },
            {
              $sort: {
                createdOn: -1,
              },
            },
            {
              $project: {
                commentByDetails: { $arrayElemAt: ["$commentByDetails", 0] },
                comment: 1,
                createdOn: 1,
                _commentBy: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "savedposts",
          let: { saved: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_post", "$$saved"],
                },
              },
            },
            {
              $project: {
                savedBy: 1,
              },
            },
          ],
          as: "savedDetails",
        },
      },
      {
        $project: {
          postDescription: 1,
          postTitle: 1,
          imagePath: 1,
          createdOn: 1,
          updatedOn: 1,
          _user: 1,
          postOwner: { $arrayElemAt: ["$postOwner", 0] },
          comments: 1,
          savedDetails: 1,
        },
      },
    ]);
    // console.log(JSON.stringify(postDetails[0], null, 3));

    //------------------------------ for helpers
    let postOwner = false;
    let savedByOwner = false;
    let commentOwner = false;
    // to check postOwener is logged in user
    if (postDetails[0]._user == req.user._id) {
      postOwner = true;
    }
    // to check the post saved by logged in user
    let postSavedUsersArray = postDetails[0].savedDetails;
    for (let i = 0; i < postSavedUsersArray.length; i++) {
      if (postSavedUsersArray[i].savedBy == req.user._id) {
        savedByOwner = true;
      }
    }

    console.log(
      "postOwner==>",
      postOwner,
      "savedByOwner==>",
      savedByOwner,

    );
    // console.log('==>>>',JSON.stringify(postDetails[0], null, 3));
    res.render("postView/index", {
      post: postDetails[0],
      layout: "users-layout",
      userLogged: loginUser,
      postOwner: postOwner,
      savedByOwner: savedByOwner,
  });
  } catch (error) {
    console.log(error);
    res.render("error", { message: error, status: 404 });
  }
});

// remove comment

// timeline rendering after login to My-circle
router.get("/", async function (req, res, next) {
  try {
    let loginUser = await usersModel.findOne({ _id: req.user._id }).lean(true);
    let pipeline = [];
    let match = {
      isArchived: false,
    };
    let sort = {
      createdOn: -1,
    };
    let limit = 4;
    let skip = 0;

    io.emit('message',{data:'Event emitted from server'})

    // first stage in aggregation
    pipeline.push({ $match: match });

    //filtering posts if post(postType) in url and for aboutPst
    if (req.query.post) {
      console.log(
        "-------------------------->>inside filter post if condition"
      );
      // console.log('req.query.post----------------------->',req.query.post)
      match["$or"] = [
        {
          postTitle: { $regex: `${req.query.aboutPost}`, $options: "i" },
        },
        {
          postDescription: { $regex: `${req.query.aboutPost}`, $options: "i" },
        },
      ];

      // console.log('match----------------------->',match)

      switch (req.query.post) {
        case "mine":
          console.log(
            "-------------------------->>inside switch mine condition"
          );
          match["$or"] = [
            {
              postTitle: { $regex: `${req.query.aboutPost}`, $options: "i" },
            },
            {
              postDescription: {
                $regex: `${req.query.aboutPost}`,
                $options: "i",
              },
            },
          ];
          match["_user"] = new ObjectId(req.user._id);
          break;
        case "others":
          console.log(
            "-------------------------->>inside others mine condition"
          );
          match["$or"] = [
            {
              postTitle: { $regex: `${req.query.aboutPost}`, $options: "i" },
            },
            {
              postDescription: {
                $regex: `${req.query.aboutPost}`,
                $options: "i",
              },
            },
          ];
          match["_user"] = { $ne: new ObjectId(req.user._id) };
          break;
        default:
          console.log("in default post for all");
          break;
      }
    }
    // if for pagination page in url
    if (req.query.page) {
      let postLimit = 4;
      let paginationPage = parseInt(req.query.page);
      limit = postLimit * paginationPage;
      skip = postLimit * (paginationPage - 1);
    }

    console.log(
      "--------------------------------------pipeline before skip limit---------------------"
    );
    console.log(pipeline);
    let postsInQuery = await postsModel.aggregate(pipeline);
    let totalPosts = postsInQuery.length;

    pipeline.push({
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
              profileImagePath: 1,
            },
          },
        ],
        as: "user",
      },
    });

    pipeline.push({
      $lookup: {
        from: "comments",
        let: { comment: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_post", "$$comment"],
              },
              isDeleted:false,
            },
          },
        ],
        as: "comments",
      },
    });

    pipeline.push({
      $project: {
        postTitle: 1,
        postDescription: 1,
        _user: 1,
        imageName: 1,
        imagePath: 1,
        createdOn: 1,
        comments: { $size: "$comments" },
        user: { $arrayElemAt: ["$user", 0] },
      },
    });
    pipeline.push({ $limit: limit });
    pipeline.push({ $skip: skip });

    // if sortByTitle in url
    if (req.query.sortByTitle) {
      if (req.query.sortByTitle == "asc") {
        sort = { postTitle: 1 };
      } else {
        console.log(
          "---------------------------- in sortByTitle ---------------------"
        );
        sort = { postTitle: -1 };
      }
    }

    // if sortByDateTime in url
    if (req.query.sortByDateTime) {
      if (req.query.sortByDateTime == "desc") {
        sort["createdOn"] = 1;
      } else {
        sort["createdOn"] = -1;
      }
    }
    pipeline.push({ $sort: sort });
    // console.log(JSON.stringify(pipeline, null, 3));
    let allPostsWithUsername = await postsModel.aggregate(pipeline);
    // console.log(allPostsWithUsername);
    let postArray = [];
    console.log("-----------------------------> totalPosts", totalPosts);
    for (let i = 1; i <= Math.ceil(totalPosts / 4); i++) {
      postArray.push(i);
    }

    res.render("timeline/index", {
      title: "user-home",
      layout: "users-layout",
      posts: allPostsWithUsername,
      userLogged: loginUser,
      pageArray: postArray,
    });
  } catch (error) {
    res.render("error", { message: error, status: 404 });
  }
});

module.exports = router;
