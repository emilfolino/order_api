const express = require('express');
const router = express.Router();

const deliveries = require("../models/deliveries.js");

router.get('/', (req, res) => deliveries.getDeliveries(res, req.query.api_key));
router.post('/', (req, res) => deliveries.addDelivery(res, req.body));
router.delete('/', (req, res) => deliveries.deleteDelivery(res, req.body));


module.exports = router;
