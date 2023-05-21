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
const chatMessage = new mongoose.Schema({
    _sender:{
        type:ObjectId,
        required:true,
        ref:'usersModel'
    },
    _receiver:{
        type:ObjectId,
        required:true,
        ref:'usersModel'
    },
    message:{
        type:String,
        required:true
    }

},options)

// prehook for chatMessage model


// export

const ChatMessages = mongoose.model('chatMessages',chatMessage);
module.exports = ChatMessages;

