// Importing Express, Express Validator and Bcrypt
const express = require("express");
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

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
            return res.render('mainpage');
        }

        // Renders the sign up page if no logged in user
        return res.render('signup',
            {
                errors: []
            }
        );
    } catch (error) {
        return res.status(500).send('An error occured fetching the sign up page. Please try again.');
    }
});

/**
 * POST SignUp Router | 
 * Handles the submission of registration
 */
router.post('/signup', 
    [
        // SERVER SIDE VALIDATION
    ],
    async (req, res) => {
        try{
            const errors = validationResult(req);

            // Passing server side validation errors back
            if(!errors.isEmpty()){
                return res.render('signup',
                    {
                        errors: errors.array()
                    }
                );
            }

            // Existing User Check
            const userExist = await SCHEMAPLACEHOLDER.findOne({ username: req.body.username });

            if(userExist){
                return res.render('signup', 
                    {
                        errors: [{ msg: 'Username already exists'}]
                    }
                );
            }

            // Hashing password provided
            const hashedPass = await bcrypt.hash(req.body.password, 10);

            const newUser = new SCHEMA({
                username: req.body.username,
                password: hashedPass
            });

            await newUser.save();

            return res.redirect('/login');
        } catch (error) {
            console.log('Sign Up POST Error:', error);
            return res.status(500).send('An error occured submitting information. Please try again.');
        }
});

module.exports = router;