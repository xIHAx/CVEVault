const express = require("express");
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const router = express.Router();
const cveSchema = require('../schema/cve');
const userSchema = require('../schema/user');
const { compareSync } = require("bcrypt");

/** 
 * Function for the cleaning of descriptions
 */
function filterCveContent(cve) {

    if (desc.includes('Rejected reason:')) {
        return null;
    }

    let filterDesc = desc.replace(/Product:\s*.*/, '').trim();

    const filteredCwe = cwes.map(cwe => 
        cwe === 'NVD-CWE-noinfo' || cwe === 'NVD-CWE-Other' ? '-' : cwe
    );

    const vendors = [];
    const products = [];
    const vendorDupe = new Set();

    if (cpes && compareSync.length > 0) {
        cpes.forEach(cpe => {
            
            if(!vendorDupe.has(cpe.vendor)) {
                vendorDupe.add(cpe.vendor);
                vendors.push(cpe.vendor);
            }

            if(cpe.version === '-'){
                cpe.version = '';
            }

            products.push(`${cpe.product} ${cpe.version}`);
        });
    }

    if (vendors.length === 0){
        vendors.push('-');
    }

    
    if (products.length === 0){
        products.push('-');
    }

    return {
        filterDesc,
        filteredCwe,
        products,
        vendors
    }
}

/**
 * GET Main Page Router |
 * Retrieves and sends all cve data
 */
router.get('/', async (req, res) => {
    try {
        // Retrieves all cve data in the database
        const cveDetails = await cveSchema.find({});

        const filteredCveDetails = cveDetails
                                    .map(cve => {
                                        // Assigning original cve details to protect original data
                                        const filteredCve = cve.toObject();

                                        // Filtering description
                                        const filteredCveResults = filterCveContent(cve.Description, cve.ProblemType, cve.CPE);

                                        if (filteredCveResults) {
                                            filteredCve.Description = filteredCveResults.filterDesc;
                                            filteredCve.Products = filteredCveResults.products;
                                            filteredCve.Vendors = filteredCveResults.vendors;
                                            filteredCve.ProblemType = filteredCveResults.filteredCwe;
                                            return filteredCve;
                                        }

                                        return null;
                                    })
                                    .filter(Boolean);

        let username = "";

        // Retrieving username if user logged in
        if(req.session && req.session.userid) {
            // Retrieving username from database
            const user = await userSchema.findById(req.session.userid).select('username');
        
            // Setting username retrieved as username variable
            if(user) {
                username = user.username;
            } else {
                return res.status(500).send('Error: User logged in does not have a username.');
            }
        }

        /** Debugging for cve retrieval */
        // console.log(filteredCveDetails);
        
        // Sending the cve data to the ejs
        return res.render('main',
            {
                vulnerabilities: filteredCveDetails,
                username: username
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).send('An error encountered when retrieving the main page. Please try again.');
    }
});

/**
 * GET CVE Router |
 * Retrieves and sends data for the selected CVE
 */
router.get(['/cve/:cve_id', '/favourites/cve/:cve_id'], async (req, res) => {

    try {
        // Retrieving CVE ID from URL
        const cve_id = req.params.cve_id;
        const cveDetails = await cveSchema.findOne({ CVE_ID: cve_id });
        
        // Filtering description
        const filteredCveResults = filterCveContent(cveDetails.Description, cveDetails.ProblemType, cveDetails.CPE);

        if (!filteredCveResults) {
            return res.status(500).send('Attemping to access a rejected CVE page. Please try another CVE.');
        }

        const filteredCveDetails = {
            ...cveDetails.toObject(),
            Description: filteredCveResults.filterDesc,
            Products: filteredCveResults.products,
            Vendors: filteredCveResults.vendors,
            ProblemType: filteredCveResults.filteredCwe
        }

        return res.render('cve',
            {
                cve: filteredCveDetails
            }
        );
    } catch (error) {
        return res.status(500).send('An error occured fetching the CVE page. Please try again');
    }
});

/**
 * Export CSV POST Router |
 */
router.post(['/export-cves', '/favourites/export-cves'], async (req, res) => {
    try {
        const cve_ids = JSON.parse(req.body.selectedVulns || "[]");

        // Ensure the cve select exists
        const cveDetails = await cveSchema.find({_id: { $in: cve_ids}})

        // Ensure cves are found
        const csvFilePath = path.join(__dirname, '..', 'exports', `csv_export_${Date.now()}.csv`);

        // Creating CSV Writer
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'cve_id', title: 'CVE ID'},
                { id: 'description', title: 'Description' },
                { id: 'product', title: 'Product'},
                { id: 'vendor', title:'Vendor'},
                { id: 'basescore', title: 'Base Score'},
                { id: 'baseseverity', title: 'Base Severity'},
                { id: 'cvss', title: 'CVSS'},
                { id: 'expscore', title: 'Exploitability Score'},
                { id: 'impactscore', title: 'Impact Score'},
                { id: 'cwe_id', title: 'CWE-ID'},
                { id: 'references', title: 'References'}
            ]
        });

        // Filtering CVE Details
        const filteredCveDetails = cveDetails
            .map(cve => {
                // Assigning original cve details to protect original data
                const filteredCve = cve.toObject();

                // Filtering description
                const filteredDesc = filterCveContent(cve.Description, cve.ProblemType, cve.CPE);

                if (filteredDesc) {
                    filteredCve.Description = filteredDesc.filterDesc;
                    filteredCve.Products = filteredDesc.products;
                    filteredCve.Vendors = filteredDesc.vendors;
                    filteredCve.ProblemType = filteredDesc.filteredCwe;
                    return filteredCve;
                }

                return null;
            })
            .filter(Boolean);

            const csvData = filteredCveDetails.map(cve => ({
                cve_id: cve.CVE_ID,
                description: cve.Description,
                product: cve.Products,
                vendor: cve.Vendors,
                basescore: cve.BaseMetricV3.baseScore,
                baseseverity: cve.BaseMetricV3.baseSeverity,
                cvss: cve.BaseMetricV3.vectorString,
                expscore: cve.BaseMetricV3.exploitabilityScore,
                impactscore: cve.BaseMetricV3.impactScore,
                cwe_id: cve.ProblemType,
                references: cve.References
            }));

            // Write to csv file
            await csvWriter.writeRecords(csvData);

            // Downloading of CSV file
            res.download(csvFilePath, 'exported_cves.csv', (err) => {
                if (err) {
                    alert('Error downloading file');
                    res.redirect('/');
                }

                fs.unlink(csvFilePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting CSV file:', unlinkErr);
                });
            });
    } catch (error) {
        return res.status(500).send('An error occured posting the export. Please try again');
    }
});

module.exports = { router, filterCveContent };
