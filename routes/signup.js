// Importing Express, Express Validator and Bcrypt
const express = require("express");
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// Router object for route handling
const router = express.Router();

/**
 * GET SignUp Router | NOT TESTED
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

module.exports = router;