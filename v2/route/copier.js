const express = require('express');
const router = express.Router();

const copier = require("../models/copier.js");

router.post('/all', (req, res) => copier.copyAll(res, req.body.api_key));

router.post('/products', (req, res) => copier.copyProducts(
    res,
    req.body.api_key
));

router.post('/orders', (req, res) => copier.copyOrders(res, req.body.api_key));


module.exports = router;
