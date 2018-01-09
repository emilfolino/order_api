const express = require('express')
const bodyParser = require('body-parser');
const path = require('path')

const products = require('./products.js')
const auth = require('./auth.js')

const app = express()

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const port = 8111

app.all('*', checkAPIKey)

function checkAPIKey(req, res, next) {
    if ( req.path == '/') return next()
    if ( req.path == '/api_key') return next()

    auth.isValidAPIKey(req.query.api_key || req.body.api_key, next, req.path, res)
}

// Base route with api-documentation
app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')))

// Api key routes
app.get('/api_key', (req, res) => auth.getNewAPIKey(res, req.path, req.query.email))

// Product routes
app.get('/products', (req, res) => products.getAllProducts(res, req.query.api_key))
app.get('/product/:product_id', (req, res) => products.getProduct(res, req.query.api_key, req.params.product_id))
app.get('/product/search/:query', (req, res) => products.searchProduct(res, req.query.api_key, req.params.query))
app.post('/product', (req, res) => products.addProduct(res, req.body))

app.listen(port, () => console.log('Order api listening on port ' + port))
