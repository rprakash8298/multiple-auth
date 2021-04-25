const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    profileId: {
        type: String,
    },
    name: {
        type:String
    },
    email: {
        type:String
    },
    photos: {
        type:Array
    },
    provider: {
        type: String,
    }
})


const User = mongoose.model('User', userSchema)

module.exports = User