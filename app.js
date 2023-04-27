// import dot env pakcage
require('dotenv').config()
// import models
const usersModel = require('./models/users')
const savedPostModel = require('./models/savedPosts')
const cronDataModel = require('./models/cronData')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
// import cron
var cron = require('node-cron');
// cron scheduler
cron.schedule('*/1 * * * * *', async () => {
  try{
  // for all users 
  let users = await usersModel.find({},{_id:1})
  // console.log(users)

  // for user's  statistical data 
  for (const user of users) {
    // console.log((user._id).toString())
    let userStatisctics = await usersModel.aggregate([
      {
          $match:{
                  _id:user._id,
      
              }
          },
          {
          $lookup:{
              from:'posts',
              let:{'userId':'$_id'},
              pipeline:[
                  {
                      $match:{
                          $expr:[ '$_user','$$userId' ],
                          '_user':user._id,
                          
                          }
                      }
              ],
              as:'createdPosts'        
              }
       },
       {
           $lookup:{
              from:'savedposts',
              let:{'savedPostId':'$_id'},
              pipeline:[
                  {
                      $match:{
                          $expr:[ '$savedBy','$$savedPostId' ],
                          'savedBy':user._id,
      
                          }
                      }
              ],
              as:'savedPosts'        
              }
        },
        {
          $lookup:{
              from:'savedposts',
              let:{'id':'$_id'},
              pipeline:[
              {
                  $match:{
                      $expr:{
                          $eq:['$postBy','$$id']
                          }
                      
                      }
                  }
              ],
              as:'savedByothers'
              }
          },
      
        
        {
            $project:{
                _id:1,
                createdPosts:{ $size : '$createdPosts' },
                savedPosts:{ $size : '$savedPosts' },
                savedByothers:{ $size : '$savedByothers' }
                }
            }
      ])
      let  [ userStats ]  = userStatisctics;
      
      // console.log()
      let toInsert ={
        _user:userStats._id,
        createdPosts:userStats.createdPosts,
        savedPosts:userStats.savedPosts,
        savedByothers:userStats.savedByothers
      }
      // console.log(toInsert)
      await cronDataModel.updateOne({_user:toInsert._user},{$set:toInsert},{upsert:true})
  }  
  
  // console.log('running a task every second');

  }
  catch(error){
    console.log(error)
  }
});


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var helperHandlebar = require("handlebars-helpers")();
// import mongoose and connect express with mongodb
try{
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection;
  console.log(process.env.MONGO_URL)
  
    db.on('error',(error)=>{
      console.log(error)
    }) ;
    db.once('open',()=>{
      console.log('mongodb connected!')
    })
  }
  catch(error){
    console.loog(error)
  }


var indexRouter = require('./routes/index');


// ---------------------------------
var timelineRouter = require('./routes/timeline');
var profileRouter = require('./routes/profile');
var userRouter = require('./routes/users');
var PostRouter = require('./routes/post');
var savedPostsRouter = require('./routes/saved-posts');
var reportRouter = require('./routes/report');


const customHelpers = require("./helpers/helper");
//import express-handlerbars
var exphbs = require('express-handlebars');
const { error } = require('console');
//handlebar-engine properties
var hbs = exphbs.create({
  extname:'.hbs',
  defaultLayout:'layout',
  layoutsDir:path.join(__dirname,'views/layouts'),
  partialsDir:path.join(__dirname,'views/partials'),
  helpers:{...helperHandlebar,...customHelpers} 
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// engine setup
app.engine('hbs',hbs.engine);
app.set('view engine', 'hbs');

// import passport and passport-local
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieSession = require('cookie-session');
const session = require('express-session')

// initalize cookie and session
app.use(cookieSession({
  secret: "session",
  key: "202cb962ac59075b964b07152d234b70",
}));

app.use(session({
  secret: "202cb962ac59075b964b07152d234b70",
  saveUninitialized: true,
  resave: true,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  cookie: { secure: true }
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cookie parser
app.use(cookieParser());
// initlize passport and session
app.use(passport.initialize()); 
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req,res,next){
  // console.log(req.user,"local variable assigned")
  res.locals.user = req.user;
  next();
})

app.use('/', indexRouter);

// authentication middleware
app.use(function(req,res,next){
  if(!req.user){
    console.log('-------- not authenticate middleware------')
    return res.redirect('/')
  }
  next();
})


app.use('/timeline',timelineRouter);
app.use('/profile',profileRouter);
app.use('/post',PostRouter);
app.use('/saved-posts',savedPostsRouter);
app.use('/report',reportRouter);
app.use('/users',userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
