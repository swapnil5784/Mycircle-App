// import modules of model creations
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const commentsModel = require('../models/users')
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
    _user:{
        type:ObjectId,
        required:true
    },
    _post:{
        type:ObjectId,
        required:true
    },

},options)

// prehook for post model


// export

const Comments = mongoose.model('Comments',posts);
module.exports = Comments;

