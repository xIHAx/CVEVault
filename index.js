/**
 * Main Entry Point for the Web Application
 * NOTE THAT THIS VERSION HAS NOT BEEN TESTED
 */

// Necessary Packages for the Web Application
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const crypto = require('crypto');
const MongoStore = require('connect-mongo');

const app = express();
const bodyParser = require('body-parser');
const port = 3000;

// Session Key on each server run
const sessionKey = crypto.randomBytes(32).toString('hex');
console.log(sessionKey);

// MongoDB URI
const mongoURI = 'MONGODB URI';

// Setting up the dependencies
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');

// Setting up the path for static files
app.use(express.static(__dirname + '/public'));

// Setting up connection with database (MongoDB)
mongoose.connect(mongoURI, {
    useNewURLParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB');
})
.catch(err => {
    console.error('Connection error to MongoDB: ', err);
    // process.exit(1);
    // Uncomment above for when actual DB uri provided
});

// Setting up session
app.use(session({
    secret: sessionKey,
    resave: false,
    saveUninitialized: true,
    /** Uncomment once db connection setup
    store: MongoStore.create({
        mongoURL: mongoURI,
        ttl: 24 * 60 * 60 // TTL for session store set as a day
    }), */
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 // Cookies expire in a day
    }
}));

// Adding route handlers
const mainRoutes = require('./routes/mainpage');
const loginRoutes = require('./routes/login');
const signupRoutes = require('./routes/signup');

// Instructing the app to use these routes
app.use('/', mainRoutes);
app.use('/', signupRoutes);
app.use('/', loginRoutes.router);

// Security Headers to protect against XSS - Mention in report
app.use((req, res, next) => {
    res.set({
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block'
    });
    next();
});

// Listening for HTTP requests
app.listen(port, () => {
    console.log(`CVE Application listening on port ${port}`);
});