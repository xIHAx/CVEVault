/** 
 * signup.js |
 * Handles the routers to do with signing up
*/

// Importing the required files and functions
const express = require("express");
const bcrypt = require('bcrypt');
const userSchema = require('../schema/user');

// Router object for route handling
const router = express.Router();

/**
 * GET SignUp Router | 
 * Handles the display of sign up page to users
 */
router.get('/signup', (req, res) => {
    try{
        // Checks for logged in user
        if(req.session && req.session.userid){
            return res.redirect('/');
        }

        // Renders the sign up page if no logged in user
        return res.render('signup',
            {
                emailError: null,
                nameError: null
            }
        );
    } catch (error) {
        // Debugging Code
        // console.log(error);
        return res.status(500).send('An error occured fetching the sign up page. Please try again.');
    }
});

/**
 * POST SignUp Router | 
 * Handles the submission of registration
 */
router.post('/signup', 
    async (req, res) => {
        try{
            // Existing User Check
            const userExist = await userSchema.findOne({ username: req.body.username });

            // Existing Email Check
            const emailExist = await userSchema.findOne({ email: req.body.email });

            // Set default error to null
            let emailError = null;
            let userError = null;

            // Set user error if user exists
            if(userExist){
                userError = 'Username already taken.'    
            }

            // Set email error is email used
            if(emailExist){
                emailError = 'Email already used.'
            }

            // If either has error re-render the page with errors
            if(userExist || emailExist) {
                return res.render('signup',
                    {
                        emailError: emailError,
                        nameError: userError
                    }
                );
            }

            // Hashing password provided
            const hashedPass = await bcrypt.hash(req.body.password, 10);

            // Adding new user to the database
            const newUser = new userSchema({
                username: req.body.username,
                password: hashedPass,
                email: req.body.email,
                dateCreated: Date.now() 
            });

            // Await for the db interaction to finish
            await newUser.save();

            // Redirect to login page
            return res.redirect('/login');
        } catch (error) {
            // Debugging code
            // console.log(error);
            return res.status(500).send('An error occured submitting information. Please try again.');
        }
});

module.exports = router;