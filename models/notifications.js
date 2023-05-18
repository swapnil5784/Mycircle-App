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
const notification = new mongoose.Schema({
    _from:{
        type:ObjectId,
        required:true,
        ref:'usersModel'
    },
    _to:{
        type:ObjectId,
        required:true,
        ref:'usersModel'
    },
    title:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    isSeen:{
        type:Boolean,
        default:false,
        required:true
    },
    seenTime:{
        type:Date,
    }

},options)

// prehook for post model


// export

const notifications = mongoose.model('notification',notification);
module.exports = notifications;

