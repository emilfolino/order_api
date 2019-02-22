const express = require('express');
const path = require('path');
const router = express.Router();

const auth = require('./models/auth.js');

const products = require('./models/products.js');
const orders = require('./models/orders.js');
const orderItems = require('./models/order_items.js');
const deliveries = require('./models/deliveries.js');
const invoices = require('./models/invoices.js');
const copier = require('./models/copier.js');


router.all('*', checkAPIKey);

function checkAPIKey(req, res, next) {
    if ( req.path == '/') {
        return next();
    }

    if ( req.path == '/api_key') {
        return next();
    }

    auth.isValidAPIKey(req.query.api_key || req.body.api_key, next, req.path, res);
}



// Base route with api-documentation
router.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')));



// Api key routes and JWT auth
router.get('/api_key', (req, res) => auth.getNewAPIKey(res, req.path, req.query.email));
router.post('/login', (req, res) => auth.login(res, req.body));
router.post('/register', (req, res) => auth.register(res, req.body));



// Product routes
router.get('/products', (req, res) => products.getAllProducts(res, req.query.api_key));
router.get('/product/:product_id', (req, res) => products.getProduct(res,
    req.query.api_key,
    req.params.product_id));
router.get('/product/search/:query', (req, res) => products.searchProduct(res,
    req.query.api_key,
    req.params.query));
router.post('/product', (req, res) => products.addProduct(res, req.body));
router.put('/product', (req, res) => products.updateProduct(res, req.body));
router.delete('/product', (req, res) => products.deleteProduct(res, req.body));



// Order routes
router.get('/orders', (req, res) => orders.getAllOrders(res, req.query.api_key));
router.get('/order/:order_id', (req, res) => orders.getOrder(res,
    req.query.api_key,
    req.params.order_id));
router.get('/order/search/:query', (req, res) => orders.searchOrder(res,
    req.query.api_key,
    req.params.query));

router.post('/order', (req, res) => orders.addOrder(res, req.body));
router.put('/order', (req, res) => orders.updateOrder(res, req.body));
router.delete('/order', (req, res) => orders.deleteOrder(res, req.body));



// Order_items routes
router.post('/order_item', (req, res) => orderItems.addOrderItem(res, req.body));
router.put('/order_item', (req, res) => orderItems.updateOrderItem(res, req.body));
router.delete('/order_item', (req, res) => orderItems.deleteOrderItem(res, req.body));



// Delivery routes
router.get('/deliveries', (req, res) => deliveries.getDeliveries(res, req.query.api_key));
router.post('/delivery', (req, res) => deliveries.addDelivery(res, req.body));



// Invoice routes
router.get("/invoices",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => invoices.getInvoices(res, req.query.api_key));
router.get("/invoice/:invoice_id",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => invoices.getInvoice(res,
        req.query.api_key,
        req.params.invoice_id));
router.post("/invoice",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => invoices.addInvoice(res, req.body));



// Copier routes
router.post('/copy_all', (req, res) => copier.copyAll(res, req.body.api_key));
router.post('/copy_products', (req, res) => copier.copyProducts(res, req.body.api_key));
router.post('/copy_orders', (req, res) => copier.copyOrders(res, req.body.api_key));



module.exports = router;
