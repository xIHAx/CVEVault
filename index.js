/**
 * Main Entry Point for the Web Application
 * NOTE THAT THIS VERSION HAS NOT BEEN TESTED
 */

// Necessary Packages for the Web Application
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

// Setting up the dependencies
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');

// Location of Static CSS Files
app.use(express.static(__dirname + '/public'));

/** 
 * TO BE DONE:
 * 1. Session
 * 2. Connecting to MongoDB
 * 3. Routes Setup
 */

// Listening for HTTP requests
app.listen(port, () => {
    console.log(`CVE Application listening on port ${port}`);
});