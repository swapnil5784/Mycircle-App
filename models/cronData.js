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
const cronData = new mongoose.Schema({
    _user:{
        type:ObjectId,
        required:true,
        ref:'usersModel'
    },
    createdPosts:{
        type:Number,
        required:true
    },
    savedPosts:{
        type:Number,
        required:true
    },
    savedByothers:{
        type:Number,
        required:true
    }

},options)

// prehook for post model


// export

const CronData = mongoose.model('CronData',cronData);
module.exports = CronData;

