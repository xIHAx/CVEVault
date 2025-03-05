const express = require("express");
const router = express.Router();
const cveSchema = require('../schema/cve');
const userSchema = require('../schema/user');
const { compareSync } = require("bcrypt");

/** 
 * Function for the cleaning of descriptions
 */
function filterDescription(desc, cwes, cpes) {

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

    // console.log(cpes);

    if (cpes && compareSync.length > 0) {
        cpes.forEach(cpe => {
            
            if(!vendorDupe.has(cpe.vendor)) {
                vendorDupe.add(cpe.vendor);
                vendors.push(cpe.vendor);
            }

            products.push(`${cpe.product} ${cpe.version}`);
        });
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
                                        const filteredDesc = filterDescription(cve.Description, cve.ProblemType, cve.CPE);

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
router.get('/cve/:cve_id', async (req, res) => {

    try {
        // Retrieving CVE ID from URL
        const cve_id = req.params.cve_id;
        const cveDetails = await cveSchema.findOne({ CVE_ID: cve_id });
        
        // Filtering description
        const filteredDesc = filterDescription(cveDetails.Description, cveDetails.ProblemType);

        if (!filteredDesc) {
            return res.status(500).send('Attemping to access a rejected CVE page. Please try another CVE.');
        }

        const filteredCveDetails = {
            ...cveDetails.toObject(),
            Description: filteredDesc.filterDesc,
            Product: filteredDesc.product,
            ProblemType: filteredDesc.filteredCwe
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
router.post('/export-cve', async (req, res) => {
    try {
        const cve_ids = JSON.parse(req.body.selectedVulns || "[]");

    } catch (error) {
        return res.status(500).send('An error occured posting the export. Please try again');
    }
});

module.exports = { router, filterDescription };
