const express = require('express');
const router = express.Router();

const auth = require("../models/auth.js");

router.get('/api_key', (req, res) => auth.getNewAPIKey(res, req.path, req.query.email));
router.post('/login', (req, res) => auth.login(res, req.body));
router.post('/register', (req, res) => auth.register(res, req.body));


module.exports = router;
