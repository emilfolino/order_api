const db = require("../db/database.js");

module.exports = (function () {
    const dataFields = "invoiceId as id, o.orderId as order_id," +
        " customerName as name, customerAddress as address," +
        " customerZip as zip, customerCity as city," +
        " customerCountry as country, (totalPrice / 100) as total_price";

    function getInvoices(res, apiKey) {
        db.all("SELECT " + dataFields +
                " FROM invoices i" +
                " INNER JOIN orders o ON o.orderId = i.orderId AND o.apiKey = i.apiKey" +
                " WHERE i.apiKey = ?",
            apiKey, (err, rows) => {
                if (err) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "/orders",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                res.json( { data: rows } );
            });
    }

    function getInvoice(res, apiKey, invoiceId) {
        if (Number.isInteger(parseInt(invoiceId))) {
            db.get("SELECT " + dataFields +
                    " FROM invoices i" +
                    " INNER JOIN orders o ON o.orderId = i.orderId AND o.apiKey = i.apiKey" +
                    " WHERE i.apiKey = ? AND invoiceId = ?",
                apiKey,
                invoiceId,
                (err, row) => {
                    if (err) {
                        return res.status(401).json({
                            errors: {
                                status: 401,
                                source: "/orders",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }

                    res.json( { data: row } );
                });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute invoice id " +
                        " is not an integer."
                }
            });
        }
    }

    function addInvoice(res, body) {
        db.run("INSERT INTO invoices (invoiceId, orderId, totalPrice, apiKey)" +
            " VALUES (?, ?, ?, ?)",
        body.id,
        body.order_id,
        body.total_price * 100,
        body.api_key, (err) => {
            if (err) {
                res.status(400).json({
                    errors: {
                        status: 400,
                        detail: err.message
                    }
                });
            } else {
                res.status(201).json({ data: body });
            }
        });
    }

    return {
        getInvoices: getInvoices,
        getInvoice: getInvoice,
        addInvoice: addInvoice
    }
}());
