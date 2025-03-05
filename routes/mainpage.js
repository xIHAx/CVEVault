const express = require("express");
const router = express.Router();
const cveSchema = require('../schema/cve');
const userSchema = require('../schema/user');

/** 
 * Function for the cleaning of descriptions
 */
function filterDescription(desc, cwes) {

    if (desc.includes('Rejected reason:')) {
        return null;
    }

    let product = '';

    const productMatch = desc.match(/Product:\s*([^V\n]+)/i);

    if(productMatch) {
        product = productMatch[1].trim().replace(/,\s*$/, '');
    }

    let filterDesc = desc.replace(/Product:\s*.*/, '').trim();

    const filteredCwe = cwes.map(cwe => 
        cwe === 'NVD-CWE-noinfo' ? '-' : cwe
    );
    
    return {
        filterDesc,
        product,
        filteredCwe
    }
}

/**
 * GET Main Page Router |
 * Retrieves and sends all cve data
 */
router.get('/', async (req, res) => {
    try {
        /**
            const vendorSearch = req.params.vendor ? req.params.vendor.trim() : "";
            const cveidSearch = req.params.cve_id ? req.params.cve_id.trim() : "";
            const productSearch = req.params.product ? req.params.product.trim() : "";

            if (vendorSearch) {
                
            }
        **/

        // Retrieves all cve data in the database
        const cveDetails = await cveSchema.find({});

        const filteredCveDetails = cveDetails
                                    .map(cve => {
                                        // Assigning original cve details to protect original data
                                        const filteredCve = cve.toObject();

                                        // Filtering description
                                        const filteredDesc = filterDescription(cve.Description, cve.ProblemType);

                                        if (filteredDesc) {
                                            filteredCve.Description = filteredDesc.filterDesc;
                                            filteredCve.Product = filteredDesc.product;
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
        // console.log(cveDetails);
        
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
router.get('/cve:id', async (req, res) => {

    try {
        // Retrieving CVE ID from URL
        const cve_id = parseInt(req.params.id, 10);
        const cvedata = await cveSchema.findById({ cve_id });

        return res.render('cve',
            {
                cvedata: cvedata
            }
        );
    } catch (error) {
        return res.status(500).send('An error occured fetching the CVE page. Please try again');
    }
});


module.exports = router;
