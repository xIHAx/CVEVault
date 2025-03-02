// Placeholder items | Nothing here is set in stone to be updated and further adjusted

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
        return res.render('mainpage',
            {
                vulnerabilities: cveDetails
            }
        );
    } catch (error) {
        return res.status(500).send('An error encountered when retrieving the main page. Please try again.');
    }
});

/** 
 * GET Favourites Router |
 * Retrieves the favourites for current user
 */
router.get('/favourites', async (req, res) => {
    try {
        if (req.session && req.session.userid ) {
            const user = await userSchema.findById(req.session.userid);
            const cveDetails = await cveSchema.find({ cveid: { $in: user.favourites }});

            return res.render('favourites',
                {
                    favourites: cveDetails
                }
            );
        }

        return res.render('login');
    } catch (error) {
        return res.status(500).send('An error occured fetching the favourites page. Please try again.');
    }
});

/**
 * POST Favourites Router |
 * Handles the adding to favourites for current user
 */
router.post('/addfavourite:id', async (req, res) => {
    try {
        if (req.session && req.session.userid ) {
            const user_id = req.session.userid;
            const {cve_id} = req.body.cveid;

            // Ensures the cve selected exists
            const cveExists = await cveSchema.findById({ cve_id });

            if(!cveExists) {
                return res.status(404).send('The cve being selected does not exist.');
            }

            await userSchema.findByIdAndUpdate(
                    user_id,
                    { $addtoset: { favourites : cve_id }},
                    { new: true }
            );

            return res.redirect('/favourites');
        }

        return res.render('login');
    } catch (error) {
        return res.status(500).send('An error occured adding to favourites. Please try again.');
    }
});

/**
 * POST Remove-Favourites Router |
 * Handles the removal of favourites
 * from a user
 */
router.post('/remove-favourite', async (req, res) => {
    try {
        if (req.session && req.session.userid ) {
            const user_id = req.session.userid;
            const {cve_id} = req.body.cveid;

            // Ensures the cve selected exists
            const cveExists = await cveSchema.findById({ cve_id });

            if(!cveExists) {
                return res.status(404).send('The cve being selected does not exist.');
            }

            await userSchema.findByIdAndUpdate(
                    user_id,
                    { $pull: { favourites : cve_id }},
                    { new: true }
            );

            return res.redirect('/favourites');
        }

        return res.render('login');


    } catch (error) {
        return res.status(500).send('An error occured removing from favourites. Please try again.');
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
