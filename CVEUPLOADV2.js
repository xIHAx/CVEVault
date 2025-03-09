/**
 * Javascript file to handle the upload of CVEs to the mongodb
 */

const mongoose = require('mongoose');
const fs = require('fs');

// Define MongoDB connection URL
const MONGO_URI = '<Mongodb URI GOES HERE Removed for gitlab>';

// Define Base Metric V3 Schema
const baseMetricV3Schema = new mongoose.Schema({
    version: String,
    vectorString: String,
    attackVector: String,
    attackComplexity: String,
    privilegesRequired: String,
    userInteraction: String,
    scope: String,
    confidentialityImpact: String,
    integrityImpact: String,
    availabilityImpact: String,
    baseScore: Number,
    baseSeverity: String,
    exploitabilityScore: Number,
    impactScore: Number
}, { _id: false });

// Define CPE schema
const cpeSchema = new mongoose.Schema({
    part: String,
    vendor: String,
    product: String,
    version: String,
    update: String
}, { _id: false });

// Define CVE data schema with nested BaseMetricV3 and CPE data
const dataSchema = new mongoose.Schema({
    CVE_ID: String,
    Assigner: String,
    Date_updated: Date,
    Date_published: Date,
    Description: String,
    References: [String],
    ProblemType: [String], 
    CPE: [cpeSchema],  // Nested array of CPE objects
    BaseMetricV3: baseMetricV3Schema 
});

const DataModel = mongoose.model('CVE', dataSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        processJSONFile('./nvdcve-1.1-2020.json');  // Update with the correct file path
    })
    .catch(err => console.error('MongoDB connection error:', err));

/**
 * processJSONFile |
 * Handles the structuring of CVE data and uploading to db
 */
function processJSONFile(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(rawData);
        let results = [];

        // Looping through each item
        jsonData.CVE_Items.forEach(item => {
            const cveMeta = item.cve.CVE_data_meta || {};
            const descriptionData = item.cve.description?.description_data || [];
            const referencesData = item.cve.references?.reference_data || [];
            const problemTypeData = item.cve.problemtype?.problemtype_data || [];
            const impactData = item.impact?.baseMetricV3 || {};
            const cvssV3Data = impactData.cvssV3 || {};
            const affectedData = item.configurations?.nodes || [];

            // Extract CWE IDs
            let problemTypes = problemTypeData.flatMap(entry => 
                entry.description ? entry.description.map(desc => desc.value) : []
            );

            // Extract and processing CPE data into structured format
            let cpeData = affectedData.flatMap(node => 
                node.cpe_match ? node.cpe_match.map(cpe => parseCPE(cpe.cpe23Uri)) : []
            );

            // Setting the structure of data to be uploaded
            let extractedData = {
                CVE_ID: cveMeta.ID || "Unknown",
                Assigner: cveMeta.ASSIGNER || "Unknown",
                Date_updated: new Date(item.lastModifiedDate || null),
                Date_published: new Date(item.publishedDate || null),
                Description: descriptionData.length > 0 ? descriptionData[0].value : "No description available",
                References: referencesData.map(ref => ref.url),
                ProblemType: problemTypes.length > 0 ? problemTypes : ["Unknown"],
                CPE: cpeData,  // Store structured CPE data
                BaseMetricV3: {
                    version: cvssV3Data.version || null,
                    vectorString: cvssV3Data.vectorString || null,
                    attackVector: cvssV3Data.attackVector || null,
                    attackComplexity: cvssV3Data.attackComplexity || null,
                    privilegesRequired: cvssV3Data.privilegesRequired || null,
                    userInteraction: cvssV3Data.userInteraction || null,
                    scope: cvssV3Data.scope || null,
                    confidentialityImpact: cvssV3Data.confidentialityImpact || null,
                    integrityImpact: cvssV3Data.integrityImpact || null,
                    availabilityImpact: cvssV3Data.availabilityImpact || null,
                    baseScore: cvssV3Data.baseScore || 0,
                    baseSeverity: cvssV3Data.baseSeverity || null,
                    exploitabilityScore: impactData.exploitabilityScore || 0,
                    impactScore: impactData.impactScore || 0
                }
            };

            results.push(extractedData);
        });

        // Uploading the data to the database
        if (results.length > 0) {
            DataModel.insertMany(results)
                .then(() => {
                    console.log('Data successfully uploaded');
                    mongoose.connection.close();
                })
                .catch(error => console.error('Error uploading data:', error));
        } else {
            console.log('No valid CVE data found.');
            mongoose.connection.close();
        }
    // Error handling
    } catch (error) {
        console.error('Error processing JSON file:', error);
    }
}

// Function to parse CPE strings into structured JSON format
function parseCPE(cpeString) {
    const parts = cpeString.split(':');

    return {
        part: parts[2] || "Unknown",
        vendor: parts[3] || "Unknown",
        product: parts[4] || "Unknown",
        version: parts[5] || "Unknown",
        update: parts[6] || "Unknown"
    };
}
