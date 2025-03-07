/** Login Related Routes */

// Importing required files and functions
const express = require('express');
const bcrypt = require('bcrypt');
const userSchema = require('../schema/user');

// Router object for route handling
const router = express.Router();

/**
 * GET Login Route | 
 * Renders the login page
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
        // Debugging Code
        // console.log(error);
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

            // Comparing if user exists in database
            const userCheck = await userSchema.findOne({ username: req.body.username });

            // If user does not exist re-render page with error
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
            const passwordCheck = bcrypt.compare(req.body.password, userCheck.password);

            // If password check fails re-render page with error
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

            // Redirect user to the main page
            return res.redirect('/');
        } catch (error) {
            // Debugging Code
            // console.log(error);
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
        // Debugging Code
        // console.log(error);
        return res.status(500).send('An error occured logging out. Please try again.');
    }
});

module.exports = router;