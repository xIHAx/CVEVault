/** Forget Password Related Routes */

const express = require('express');
const { body, validationResult } = require('express-validator');
const userSchema = require('../schema/user');

// Router object for route handling
const router = express.Router();

/**
 * GET Forget Password Route | 
 */
router.get('/forgot', (req, res) => {
    try{
        // Renders forget password page
        return res.render('forgot', 
            {
                errors: []
            }
        );
    } catch (error) {
        return res.status(500).send('An eror occured fetching the forget password page. Please try again.');
    }
});

/**
 * POST Forget Password Route | 
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

        // LOGIC TO SEND EMAIL VERIFICATION
    } catch (error) {
        return res.status(500).send('An eror occured submitting details. Please try again.');
    }
});

router.get('/reset', (req, res) => {
    return res.render('reset');
});

router.post('/reset', (req, res) => {

});

module.exports = router;