const mongoose = require('mongoose');

const cveSchema = new mongoose.Schema({
    title : String,
    description : String,
    body : String,
    dateCreated : Date
});

module.exports =  mongoose.model("cves", cveSchema);