const express = require('express');
const router = express.Router();

const orders = require("../models/orders.js");

router.get('/', (req, res) => orders.getAllOrders(res, req.query.api_key));
router.get('/:order_id', (req, res) => orders.getOrder(res,
    req.query.api_key,
    req.params.order_id));
router.get('/search/:query', (req, res) => orders.searchOrder(res,
    req.query.api_key,
    req.params.query));

router.post('/', (req, res) => orders.addOrder(res, req.body));
router.put('/', (req, res) => orders.updateOrder(res, req.body));
router.delete('/', (req, res) => orders.deleteOrder(res, req.body));


module.exports = router;
