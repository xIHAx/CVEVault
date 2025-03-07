/**
 * favourites.js |
 * Handles all the routers specific to the favourites feature
 */
const express = require("express");
const router = express.Router();

// Importing the relevant files and functions
const cveSchema = require('../schema/cve');
const userSchema = require('../schema/user');
const { filterCveContent, isLoggedIn } = require('../utils/utils.js');

// Ensure the routers can only be accessed on login
router.use(isLoggedIn);

/** 
 * GET Favourites Router |
 * Retrieves the favourites for current user
 */
router.get('/favourites', async (req, res) => {
    try {
        // Retrieving user information from DB using session userid
        const user = await userSchema.findById(req.session.userid);

        // Retrieving CVE details from DB 
        const cveDetails = await cveSchema.find({ _id: { $in: user.favourites }});
        const username = user.username;

        // Filtering CVE Details for page display
        const filteredCveDetails = cveDetails
                                    .map(cve => {
                                        // Assigning original cve details to protect original data
                                        const filteredCve = cve.toObject();

                                        // Using the filter functions
                                        const filteredCveResults = filterCveContent(cve.Description, cve.ProblemType, cve.CPE);

                                        // Reassigning the filtered variables to the copied data
                                        if (filteredCveResults) {
                                            filteredCve.Description = filteredCveResults.filterDesc;
                                            filteredCve.Products = filteredCveResults.products;
                                            filteredCve.Vendors = filteredCveResults.vendors;
                                            filteredCve.ProblemType = filteredCveResults.filteredCwe;
                                            return filteredCve;
                                        }

                                        return null;
                                    })
                                    // Remove the rejected (null) CVEs
                                    .filter(Boolean);

        // Render the favourites page with user and cve info
        return res.render('favourites',
            {
                username: username,
                favourites: filteredCveDetails
            }
        );
    } catch (error) {
        // Debugging Code
        // console.log(error);
        return res.status(500).send('An error occured fetching the favourites page. Please try again.');
    }
});

/**
 * POST Favourites Router |
 * Handles the adding to favourites for current user
 */
router.post('/add-favourites', async (req, res) => {
    try {
        // Retrieving the user id from session
        const user_id = req.session.userid;

        // Retrieving the ids of selected CVEs
        const cve_ids = JSON.parse(req.body.selectedVulns || "[]");

        // Ensures the cves selected exists
        const cveExists = await cveSchema.find({_id: { $in: cve_ids } });

        // Debugging Code
        //console.log('Cve_Ids', cve_ids);
        //console.log('cveExists', cveExists.length);

        // Return an error if a selected CVE is not found in the db
        if(cveExists.length !== cve_ids.length) {
            return res.status(404).send('One or more CVEs selected does not exist.');
        }

        // Update the user informationn on the db with the selected CVEs
        await userSchema.findByIdAndUpdate(
                user_id,
                { $addToSet: { favourites : { $each: cve_ids } }},
                { new: true }
        );

        // Redirect users to favourites page
        return res.redirect('/favourites');

    } catch (error) {
        // Debugging code
        // console.log(error);
        return res.status(500).send('An error occured adding to favourites. Please try again.');
    }
});

/**
 * POST Remove-Favourites Router |
 * Handles the removal of favourites
 * from a user
 */
router.post('/favourites/remove-favourites', async (req, res) => {
    try {
        // Retrieves user id from session
        const user_id = req.session.userid;

        // Retrieves the id of selected vulnerabilities
        const cve_ids = JSON.parse(req.body.selectedVulns || "[]");
        
        // Ensures the cve selected exists
        const cveExists = await cveSchema.find({_id: { $in: cve_ids } });

        // Debugging Code
        //console.log('Cve_Ids', cve_ids.length);
        //console.log('cevExists', cveExists.length);

        // Returns an error if the selected cves are not found in the db
        if(cveExists.length !== cve_ids.length) {
            return res.status(404).send('One or more CVEs selected does not exist.');
        }

        // Update the user information on the database
        await userSchema.findByIdAndUpdate(
                user_id,
                { $pullAll: { favourites: cve_ids }},
                { new: true }
        );

        // Refresh the favourites page
        return res.redirect('/favourites');
    
    } catch (error) {
        // Debugging Code
        // console.log(error)
        return res.status(500).send('An error occured removing from favourites. Please try again.');
    }
});

module.exports = router;

