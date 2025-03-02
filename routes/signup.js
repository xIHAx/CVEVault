// Importing Express, Express Validator and Bcrypt
const express = require("express");
const { body, validationResult } = require('express-validator');
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
    async (req, res) => {
        try{
            // Passing server side validation errors back
            // Uncomment if using
            /**
            const errors = validationResult(req);
            
            if(!errors.isEmpty()){
                return res.render('signup',
                    {
                        errors: errors.array()
                    }
                );
            }*/

            // Existing User Check
            const userExist = await userSchema.findOne({ username: req.body.username });

            if(userExist){
                return res.render('signup', 
                    {
                        errors: [{ msg: 'Username already exists'}]
                    }
                );
                
                
                // Debugging code
                // return res.status(500).send('user exists');
                
            }

            // Hashing password provided
            const hashedPass = await bcrypt.hash(req.body.password, 10);

            const newUser = new userSchema({
                username: req.body.username,
                password: hashedPass,
                email: req.body.email,
                dateCreated: Date.now() 
            });

            await newUser.save();

            return res.redirect('/login');
        } catch (error) {
            console.log('Sign Up POST Error:', error);
            return res.status(500).send('An error occured submitting information. Please try again.');
        }
});

module.exports = router;