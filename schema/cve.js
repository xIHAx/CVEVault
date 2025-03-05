const mongoose = require('mongoose');

const cveSchema = new mongoose.Schema({
    CVE_ID : String,
    Assigner : String,
    Date_updated : Date,
    Date_published : Date,
    Description: String,
    Vendor: String,
    BaseMetricV3: {
        vectorString: String,
        baseScore: Number,
        baseSeverity: String
    },
    exploitabilityScore: Number,
    impactScore: Number,
    ProblemType: [String],
    References: [String]
});

module.exports =  mongoose.model("cves", cveSchema);