// import modules of model creations
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const options = {
    timestamps:{
        createdAt:'createdOn',
        updatedAt:'updatedOn'
    }
}
// make schema
const savedPosts = new mongoose.Schema({
    savedBy:{
        type:ObjectId,
        required:true
    },
    _post:{
        type:ObjectId,
        required:true
    },
    isSavedOnce:{
        type:Boolean,
        required:true,
        default:true
    },
    postBy:{
        type:ObjectId,
        required:true,
    }


},options)

// prehook for post model


// export

const SavedPosts = mongoose.model('SavedPosts',savedPosts);
module.exports = SavedPosts;

