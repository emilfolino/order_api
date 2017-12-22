const express = require('express')
const app = express()
const path = require('path');

const products = require('./products.js')

// Base route with api-documentation
app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')))


// Products
app.get('/products', (req, res) => res.json(products.getAllProducts()))

app.listen(1337, () => console.log('Order api listening on port 3000!'))
