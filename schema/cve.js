const mongoose = require('mongoose');

const cveSchema = new mongoose.Schema({
    CVE_ID : String,
    Assigner : String,
    Date_updated : Date,
    Date_published : Date,
    Description: String
});

module.exports =  mongoose.model("cves", cveSchema);