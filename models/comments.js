// import modules of model creations
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const commentsModel = require('../models/users')
const usersModel = require('../models/users')
const postsModel = require('../models/posts')

const options = {
    timestamps:{
        createdAt:'createdOn',
        updatedAt:'updatedOn'
    }
}
// make schema
const posts = new mongoose.Schema({
    comment:{
        type:String,
        required:true
    },
    _commentBy:{
        type:ObjectId,
        required:true,
        ref:usersModel

    },
    _post:{
        type:ObjectId,
        required:true,
        ref:postsModel
    },

},options)

// prehook for post model


// export

const Comments = mongoose.model('Comments',posts);
module.exports = Comments;

