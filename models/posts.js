// import modules of model creations
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const usersModel = require('../models/users')
const options = {
    timestamps:{
        createdAt:'createdOn',
        updatedAt:'updatedOn'
    }
}
// make schema
const posts = new mongoose.Schema({
    postTitle:{
        type:String,
        required:true
    },
    postDescription:{
        type:String,
        required:true
    },
    _user:{
        type:ObjectId,
        required:true
    },
    imageName:{
        type:String,
    },
    imagePath:{
        type:String,
    },
    isArchived:{
        type:Boolean,
        default:false,
        required:true
    }

},options)

// prehook for post model


// export

const Posts = mongoose.model('Posts',posts);
module.exports = Posts;

