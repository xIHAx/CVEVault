// Placeholder items | Nothing here is set in stone to be updated and further adjusted

const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

/**
 * GET Main Page Router |
 * Retrieves and sends all cve data
 */
router.get('/', async (req, res) => {
    try {
        // Retrieving all cve details
        const cveDetails = await CVESCHEMA.find({});

        // Sending the cve data to the ejs
        return res.render('mainpage',
            {
                cve_details: cveDetails
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
            const user = await USERSCHEMA.findById(req.session.userid);
            const cveDetails = await CVESCHEMA.find({ cveid: { $in: user.favourites }});

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
            const cveExists = await CVESCHEMA.findById({ cve_id });

            if(!cveExists) {
                return res.status(404).send('The cve being selected does not exist.');
            }

            await USERSCHEMA.findByIdAndUpdate(
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
})

/**
 * GET CVE Router |
 * Retrieves and sends data for the selected CVE
 */
router.get('/cve:id', async (req, res) => {

    try {
        // Retrieving CVE ID from URL
        const cve_id = parseInt(req.params.id, 10);

        // CVSS CALCULATIONS?
        const cvedata = await CVESCHEMA.findById({ cve_id });

        return res.render('cve',
            {
                cvedata: cvedata
            }
        );
    } catch (error) {
        return res.status(500).send('An error occured fetching the CVE page. Please try again');
    }
});

router.get('/search:SEARCH PARAMETERS', (req, res) => {
    // To discuss how search should be done with ryann
    return res.render('SEARCH PAGE PLACEHOLDER');
});

module.exports = router;
