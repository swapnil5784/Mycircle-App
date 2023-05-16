// import modules of model creations
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const commentsModel = require('../models/users')
const usersModel = require('../models/users')
const postsModel = require('../models/posts')
const moment = require('moment')
const options = {
    timestamps:{
        createdAt:'createdOn',
        updatedAt:'updatedOn'
    }
}
// make schema
const comments = new mongoose.Schema({
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
comments.pre('save',async function(next){
    try{
        // this.timeAgo = 
        const _this = this
        console.log(moment(this.createdOn).fromNow())
        _this['timeAgo'] = moment(_this.createdOn).fromNow()
        console.log('--------------------------> pre hook',_this)
    }
    catch(error){
        console.log(error)
    }
    next();
})

// export

const Comments = mongoose.model('Comments',comments);
module.exports = Comments;

