/** 
 * forget.js | 
 * Handles the routes related to forget password. 
 * These routes are not fully implemented and remain as a proof of concept
 */

const express = require('express');
const userSchema = require('../schema/user');
const bcrypt = require('bcrypt');

// Router object for route handling
const router = express.Router();

/**
 * GET Forget Password Route | 
 */
router.get('/forgot', async (req, res) => {
    try{
        // If user logged in redirect to main page
        if (req.session && req.session.userid) {
            return res.redirect('/');
        }
        // Renders forget password page 
        return res.render('forgot',
            {
                emailError: null
            }
        );
    } catch (error) {
        // Debugging Code
        // console.log(error)
        return res.status(500).send('An eror occured fetching the forget password page. Please try again.');
    }
});

/**
 * POST Forget Password Route | 
 * Handles the submission of the forget password request
 * 
 * The implementation of this route is a proof of concept, 
 * due to unforeseen challenges we were unable to properly
 * implement the idea for forget password. Therefore, it is
 * incomplete.
 */
router.post('/forgot', async (req, res) => {
    try{
        // Finding user with email inputted
        const userCheck = await userSchema.findOne({ email: req.body.email });
        console.log(userCheck)
        // If email does not exist re-render page with error
        if(!userCheck){
            return res.render('forgot', 
                {
                    emailError: 'Email entered does not exist'
                }
            );
        }

        /**
         * Placeholder for logic to send email verification to users.
         * 
         */

        
        // Hashing the password
        const hashedPass = await bcrypt.hash(req.body.password, 10);

        // Updating the users password
        userCheck.password = hashedPass;
        await userCheck.save();

        // Success Alert and Redirect to login
        return res.send(`
            <script>
                alert("Password successfully reset please log in");
                window.location.href = "/login";
            </script>
        `);

    } catch (error) {
        // Debugging Code
        // console.log(error);
        return res.status(500).send('An eror occured submitting details. Please try again.');
    }
});

module.exports = router;