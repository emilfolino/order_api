const express = require('express');
const router = express.Router();

const products = require("../models/products.js");

router.get('/', (req, res) => products.getAllProducts(res, req.query.api_key));

router.get('/:product_id', (req, res) => products.getProduct(res,
    req.query.api_key,
    req.params.product_id));

router.get('/search/:query', (req, res) => products.searchProduct(res,
    req.query.api_key,
    req.params.query));

router.post('/', (req, res) => products.addProduct(res, req.body));

router.put('/', (req, res) => products.updateProduct(res, req.body));

router.delete('/', (req, res) => products.deleteProduct(res, req.body));


module.exports = router;
