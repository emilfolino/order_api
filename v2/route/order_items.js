const express = require('express');
const router = express.Router();

const orderItems = require("../models/order_items.js");

router.post('/', (req, res) => orderItems.addOrderItem(res, req.body));
router.put('/', (req, res) => orderItems.updateOrderItem(res, req.body));
router.delete('/', (req, res) => orderItems.deleteOrderItem(res, req.body));

module.exports = router;
