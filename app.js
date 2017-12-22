const express = require('express')
const app = express()
const path = require('path')

const products = require('./products.js')
const auth = require('./auth.js')


app.all('*', checkAPIKey)

function checkAPIKey(req, res, next) {
    if ( req.path == '/') return next()
    if ( req.path == '/api_key') return next()
    if ( req.path == '/no_api_key') return next()

    if (auth.isValidAPIKey(req.query.api_key)) {
        return next()
    }

    res.status(401).json({ msg : "No valid API key provided" })
}

// Base route with api-documentation
app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')))

// Api key routes
app.get('/api_key', (req, res) => res.json(auth.getNewAPIKey(req.query.email)))

// Product routes
app.get('/products', (req, res) => res.json(products.getAllProducts()))
app.get('/product/:product_id', (req, res) => res.json(products.getProduct(req.params.product_id)))

app.listen(1337, () => console.log('Order api listening on port 3000!'))
