// import mongoose package
const mongoose = require('mongoose');

const options = {
    timestamps:{
        createdAt:"createdOn",
        updatedAt:"updatedOn"
    }
}
// model schema
const user = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    userEmail:{
        type:String,
        required:true,
    },
    gender:{
        type:String,
        default:"male",
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profileImagePath:{
        type:String,
        
    }
},options)

// model export
const users = mongoose.model('users',user);
module.exports =  users;