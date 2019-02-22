const express = require('express');
const path = require("path");
const router = express.Router();

const authModel = require("./models/auth.js");

const auth = require("./route/auth.js");
const copier = require("./route/copier.js");
const deliveries = require("./route/deliveries.js");
const invoices = require("./route/invoices.js");
const order_items = require("./route/order_items.js");
const orders = require("./route/orders.js");
const products = require("./route/products.js");

router.all('*', authModel.checkAPIKey);

router.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')));

router.use("/auth", auth);
router.use("/copier", copier);
router.use("/deliveries", deliveries);
router.use("/invoices", invoices);
router.use("/order_items", order_items);
router.use("/orders", orders);
router.use("/products", products);

module.exports = router;
