// Placeholder items | Nothing here is set in stone to be updated and further adjusted

const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

router.get('/', (req, res) => {
    return res.render('MAINPAGE PLACEHOLDER');
});

router.get('/favourites', (req, res) => {
    return res.render('FAVOURITE PAGE PLACEHOLDER');
});

router.get('/login', (req, res) => {
    return res.render('FAVOURITE PAGE PLACEHOLDER');
});

router.get('/cve:ID', (req, res) => {
    return res.render('CVE PAGE PLACEHOLDER');
});

router.get('/search:SEARCH PARAMETERS', (req, res) => {
    // To discuss how search should be done with ryann
    return res.render('SEARCH PAGE PLACEHOLDER');
});
