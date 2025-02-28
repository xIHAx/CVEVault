const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    email: String,
    favourites : String,
    dateCreated : Date
});

module.exports =  mongoose.model("users", userSchema);