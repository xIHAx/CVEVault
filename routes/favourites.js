const express = require("express");
const router = express.Router();

const cveSchema = require('../schema/cve');
const userSchema = require('../schema/user');
const { isLoggedIn } = require('./login');

// Ensure the routers can only be accessed on login
router.use(isLoggedIn);

/** 
 * GET Favourites Router |
 * Retrieves the favourites for current user
 */
router.get('/favourites', async (req, res) => {
    try {
        if (req.session && req.session.userid ) {
            const user = await userSchema.findById(req.session.userid);
            const cveDetails = await cveSchema.find({ _id: { $in: user.favourites }});

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
router.post('/add-favourites', async (req, res) => {
    try {
        const user_id = req.session.userid;
        const cve_ids = JSON.parse(req.body.selectedVulns || "[]");

        // Ensures the cve selected exists
        const cveExists = await cveSchema.find({_id: { $in: cve_ids } });

        // Debugging Code
        //console.log('Cve_Ids', cve_ids.length);
        //console.log('cevExists', cveExists.length);

        if(cveExists.length !== cve_ids.length) {
            return res.status(404).send('One or more CVEs selected does not exist.');
        }

        await userSchema.findByIdAndUpdate(
                user_id,
                { $addToSet: { favourites : { $each: cve_ids } }},
                { new: true }
        );

        return res.redirect('/favourites');

    } catch (error) {
        return res.status(500).send('An error occured adding to favourites. Please try again.');
    }
});

/**
 * POST Remove-Favourites Router |
 * Handles the removal of favourites
 * from a user
 */
router.post('/remove-favourites', async (req, res) => {
    try {
        const user_id = req.session.userid;
        const cve_id = req.body.cveId;

        // Ensures the cve selected exists
        const cveExists = await cveSchema.findById( cve_id );

        if(!cveExists) {
            /**
            // Debugging code
            console.log(cve_id);
            */
            return res.status(404).send('The cve being selected does not exist.');
        }

        await userSchema.findByIdAndUpdate(
                user_id,
                { $pull: { favourites : cve_id }},
                { new: true }
        );

        return res.redirect('/favourites');
    
    } catch (error) {
        return res.status(500).send('An error occured removing from favourites. Please try again.');
    }
});

module.exports = router;

