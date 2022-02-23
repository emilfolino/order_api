const express = require('express');
const router = express.Router();

const auth = require("../models/auth.js");
const errors = require("../models/errors.js");

router.get('/api_key', (req, res) => {
    let data = {
        message: "",
        email: ""
    };

    return res.render("api_key/form", data);
});

router.post('/api_key/confirmation', async (req, res) => {
    if (req.body.gdpr && req.body.gdpr == "gdpr") {
        return await auth.getNewAPIKey(res, req.body.email);
    }

    let data = {
        message: "Approve the terms and conditions.",
        email: req.body.email
    };

    return res.render("api_key/form", data);
});

router.get('/api_key/deregister', (req, res) => {
    let data = {
        message: "",
        email: "",
        apikey: ""
    };

    return res.render("api_key/deregister", data);
});

router.post('/api_key/deregister', (req, res) => {
    if (req.body.email && req.body.apikey &&
        req.body.email.length > 0 && req.body.apikey.length > 0) {
        return auth.deregister(res, req.body);
    }

    let data = {
        message: "Both E-mail and API-key is needed to deregister.",
        email: "",
        apikey: ""
    };

    return res.render("api_key/deregister", data);
});

router.post('/login', async (req, res) => {
    const response = await auth.login(res, req.body);

    if (response.hasOwnProperty("errors")) {
        return errors.sendError(res, error);
    }

    return res.status(201).json(response);
});

router.post('/register', async (req, res) => {
    const response = await auth.register(res, req.body);

    if (response.hasOwnProperty("errors")) {
        return errors.sendError(res, error);
    }

    return res.status(201).json(response);
});

module.exports = router;
