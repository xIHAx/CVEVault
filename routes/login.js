/** Authentication Related Routes */

const express = require('express');
const { body, validationResult } =  require('express-validator');
const bcrypt = require('bcrypt');

// Router object for route handling
const router = express.Router();

/** 
 * isLoggedIn Function | 
 * Checks if user is logged in
 * Used for favourite function
 */
function isLoggedIn(req, res, next) {
    if (req.session && req.session.userid) {
        next();
    } else {
        res.redirect('/login');
    }
}

/**
 * Login Route | NOT TESTED
 * Handles the login for users
 */
router.get('/login',
    [
        // SERVER SIDE VALIDATION HERE
    ], 
    async (req, res) => {
        
        try {
            const errors = validationResult(req);

            // Passing server side validation errors back
            if(!errors.isEmpty()){
                return res.render('login',
                    {
                        errors: errors.array()
                    }
                );
            }

            /**
             * -> Retrieve data from database matching username
             * -> If no match return login page with message
             * -> If match use bcrypt to check the match
             */
        } catch (error) {
            /**
             * Return server error
             */
        }

        return res.render('LOGIN PAGE PLACEHOLDER');
});

/**
 * Logout Route |
 * Handles the destroying of session
 */
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        return res.redirect('/login');
    });
});

module.exports = { router, isLoggedIn };