/** Login Related Routes */

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const userSchema = require('../schema/user');

// Router object for route handling
const router = express.Router();

/** 
 * isLoggedIn Function | 
 * Checks if user is logged in for routers
 */
function isLoggedIn(req, res, next) {
    if (req.session && req.session.userid) {
        next();
    } else {
        res.redirect('/login');
    }
}

/**
 * GET Login Route | 
 */
router.get('/login', (req, res) => {
    try{
        // Checks for logged in user
        if (req.session && req.session.userid){
            // Redirects user if logged in
            return res.redirect('/');
        } else {
            // Renders login page if not logged in
            return res.render('login', 
                {
                    error: null
                }
            );
        }
    } catch (error) {
        return res.status(500).send('An eror occured fetching the login page. Please try again.');
    }
});

/**
 * POST Login Route | 
 * Handles the login for users
 */
router.post('/login', 
    async (req, res) => {
        
        try {
            // Passing server side validation errors back
            // Uncomment if used
            /**
            const errors = validationResult(req);
            
            if(!errors.isEmpty()){
                return res.render('login',
                    {
                        errors: errors.array()
                    }
                );
            }
            */

            // Comparing if user exists in database
            const userCheck = await userSchema.findOne({ username: req.body.username });

            // If user does not exist inform user
            if(!userCheck){
                return res.render('login',
                    {
                        error: 'Invalid username or password'
                    }
                );

                // Debugging Code
                // return res.status(500).send('wrong user');
            }

            // Comparing if password is correct
            const passwordCheck = await bcrypt.compare(req.body.password, userCheck.password);

            if(!passwordCheck){
                return res.render('login',
                    {
                        error: 'Invalid username or password'
                    }
                );
                

                // Debugging Code
                // return res.status(500).send('wrong pass');
            }

            // Store user id in session
            req.session.userid = userCheck._id;
            return res.redirect('/');
        } catch (error) {
            console.log(error);
            return res.status(500).send('Error encountered submitting details');
        }
});

/**
 * Logout Route |
 * Handles the destroying of session
 */
router.get('/logout', (req, res) => {
    try{
        // Destroying session and routing user to login page
        req.session.destroy(() => {
            return res.redirect('/');
        });
    } catch (error) {
        return res.status(500).send('An error occured logging out. Please try again.');
    }
});

module.exports = { router, isLoggedIn };