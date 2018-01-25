const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');

const auth = require('./models/auth.js');

const products = require('./models/products.js');
const orders = require('./models/orders.js');
const orderItems = require('./models/order_items.js');

const app = express();

const port = 8111;

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.all('*', checkAPIKey);

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
app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')));



// Api key routes
app.get('/api_key', (req, res) => auth.getNewAPIKey(res, req.path, req.query.email));



// Product routes
app.get('/products', (req, res) => products.getAllProducts(res, req.query.api_key));
app.get('/product/:product_id', (req, res) => products.getProduct(res,
    req.query.api_key,
    req.params.product_id));
app.get('/product/search/:query', (req, res) => products.searchProduct(res,
    req.query.api_key,
    req.params.query));
app.post('/product', (req, res) => products.addProduct(res, req.body));
app.put('/product', (req, res) => products.updateProduct(res, req.body));
app.delete('/product', (req, res) => products.deleteProduct(res, req.body));



// Order routes
app.get('/orders', (req, res) => orders.getAllOrders(res, req.query.api_key));
app.get('/order/:order_id', (req, res) => orders.getOrder(res,
    req.query.api_key,
    req.params.order_id));
app.get('/order/search/:query', (req, res) => orders.searchOrder(res,
    req.query.api_key,
    req.params.query));

app.post('/order', (req, res) => orders.addOrder(res, req.body));
app.put('/order', (req, res) => orders.updateOrder(res, req.body));
app.delete('/order', (req, res) => orders.deleteOrder(res, req.body));



// Order_items routes
app.post('/order_item', (req, res) => orderItems.addOrderItem(res, req.body));
app.put('/order_item', (req, res) => orderItems.updateOrderItem(res, req.body));
app.delete('/order_item', (req, res) => orderItems.deleteOrderItem(res, req.body));



const server = app.listen(port, () => console.log('Order api listening on port ' + port));

module.exports = server;
