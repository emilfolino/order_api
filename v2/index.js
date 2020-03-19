const express = require('express');
const path = require("path");
const router = express.Router();

const authModel = require("./models/auth.js");

const auth = require("./route/auth.js");
const copier = require("./route/copier.js");
const deliveries = require("./route/deliveries.js");
const invoices = require("./route/invoices.js");
const orderItems = require("./route/order_items.js");
const orders = require("./route/orders.js");
const products = require("./route/products.js");

router.all('*', authModel.checkAPIKey);

router.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')));

router.use("/auth", auth);
router.use("/copier", copier);
router.use("/deliveries", deliveries);
router.use("/invoices", invoices);
router.use("/order_items", orderItems);
router.use("/orders", orders);
router.use("/products", products);

router.use(function (req, res) {
    return res.status(404).json({
        errors: {
            status: 404,
            source: req.path,
            title: "Not found",
            detail: "Could not find path: " + req.path,
        }
    });
});

module.exports = router;
