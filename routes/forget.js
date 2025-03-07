/** 
 * forget.js | 
 * Handles the routes related to forget password. 
 * These routes are not fully implemented and remain as a proof of concept
 */

const express = require('express');
const userSchema = require('../schema/user');

// Router object for route handling
const router = express.Router();

/**
 * GET Forget Password Route | 
 */
router.get('/forgot', (req, res) => {
    try{
        // Renders forget password page
        return res.render('forgot');
    } catch (error) {
        // Debugging Code
        // console.log(error)
        return res.status(500).send('An eror occured fetching the forget password page. Please try again.');
    }
});

/**
 * POST Forget Password Route | 
 * Handles the submission of the forget password request
 */
router.post('/forgot', (req, res) => {
    try{
        // Finding user with email inputted
        const emailCheck = userSchema.findOne({ email: req.body.email });

        if(!emailCheck){
            // Renders forget password page with email error
            return res.render('forgot', 
                {
                    errors: [{ msg: 'Email entered does not exist'}]
                }
            );
        }

        /**
         * Placeholder for logic to send email verification to users.
         * 
         */
    } catch (error) {
        return res.status(500).send('An eror occured submitting details. Please try again.');
    }
});

/**
 * GET Reset Router |
 * Renders the reset password page
 */
router.get('/reset', (req, res) => {
    return res.render('reset');
});

/**
 * POST Reset Router |
 * Handles the processing of the reset password
 */
router.post('/reset', (req, res) => {

});

module.exports = router;