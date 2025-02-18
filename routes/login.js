/** Authentication Related Routes */

const express = require('express');
const { body, validationResult } =  require('express-validator');
const bcrypt = requite('bcrypt');

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