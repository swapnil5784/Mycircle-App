// import mongoose
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const usersModel = require('../models/users')
// make default timestamp for every document added to the database
const options ={
    timestamps:{
        createdOn:'createdAt',
        updatedOn:'updatedAt'
    }
}
// make schema
const group = new mongoose.Schema({
    _groupAdmin:{
        type:ObjectId,
        required:true,
        ref:usersModel
    },
    groupTitle:{
        type:String,
        required:true
    },
    members:{
        type:Array,
        required:true
    }
},options)

// export
const groups = mongoose.model('groups',group)
module.exports = groups;
 