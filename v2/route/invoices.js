const express = require('express');
const router = express.Router();

const invoices = require("../models/invoices.js");
const auth = require("../models/auth.js");

router.get("/",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => invoices.getInvoices(res, req.query.api_key));

router.get("/:invoice_id",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => invoices.getInvoice(res,
        req.query.api_key,
        req.params.invoice_id));

router.post("/",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => invoices.addInvoice(res, req.body));

router.put("/",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => invoices.updateInvoice(res, req.body));

router.delete("/",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => invoices.deleteInvoice(res, req.body));

module.exports = router;
