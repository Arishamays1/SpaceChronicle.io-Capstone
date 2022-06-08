const mongoose = require('mongoose')

const discussionSchema = new mongoose.Schema({
    content:{
        type: String,
        required:[true, `Start a discussion!`]
    },
    username:{
        type: mongoose.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true})

const Discussion = mongoose.model('Discussion', discussionSchema)

module.exports = Discussion