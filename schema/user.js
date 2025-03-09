/**
 * User Schema File |
 * Contains the user schema for MongoDB
 */

const mongoose = require('mongoose');

// User Schema for corresponding data from MongoDB
const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    email: String,
    favourites : [String],
    dateCreated : Date
});

module.exports =  mongoose.model("users", userSchema);