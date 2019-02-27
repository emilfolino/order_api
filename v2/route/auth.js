const express = require('express');
const router = express.Router();

const auth = require("../models/auth.js");

router.get('/api_key', (req, res) => {
    let data = {
        message: "",
        email: ""
    };

    res.render("api_key/form", data);
});

router.post('/api_key/confirmation', (req, res) => {
    if (req.body.gdpr && req.body.gdpr == "gdpr") {
        return auth.getNewAPIKey(res, req.body.email);
    }

    let data = {
        message: "Approve the terms and conditions.",
        email: req.body.email
    };

    res.render("api_key/form", data);
});


router.post('/login', (req, res) => auth.login(res, req.body));
router.post('/register', (req, res) => auth.register(res, req.body));


module.exports = router;
