const express = require("express");
const router = express.Router();
const cveSchema = require('../schema/cve');

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

        /** Debugging for cve retrieval */
        // console.log(cveDetails);
        
        // Sending the cve data to the ejs
        return res.render('main',
            {
                vulnerabilities: cveDetails
            }
        );
    } catch (error) {
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
