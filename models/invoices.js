const db = require("../db/database.js");

const invoices = {
    dataFields: "i.ROWID as id, o.ROWID as order_id," +
        " customerName as name, customerAddress as address," +
        " customerZip as zip, customerCity as city," +
        " customerCountry as country, (totalPrice / 100) as total_price",

    getInvoices: function(res, apiKey) {
        db.all("SELECT " + invoices.dataFields +
            " FROM invoices i" +
            " INNER JOIN orders o ON o.ROWID = i.orderId AND o.apiKey = i.apiKey" +
            " WHERE i.apiKey = ?",
        apiKey, (err, rows) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/invoices",
                        title: "Database error",
                        detail: err.message
                    }
                });
            }

            res.json( { data: rows } );
        });
    },

    getInvoice: function(res, apiKey, invoiceId, status=200) {
        if (Number.isInteger(parseInt(invoiceId))) {
            db.get("SELECT " + invoices.dataFields +
                    " FROM invoices i" +
                    " INNER JOIN orders o ON o.ROWID = i.orderId AND o.apiKey = i.apiKey" +
                    " WHERE i.apiKey = ? AND i.ROWID = ?",
            apiKey,
            invoiceId,
            function(err, row) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/invoice/" + invoiceId,
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                res.status(status).json( { data: row } );
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
    },

    addInvoice: function(res, body) {
        db.run("INSERT INTO invoices (orderId, totalPrice, apiKey)" +
            " VALUES (?, ?, ?)",
        body.order_id,
        body.total_price * 100,
        body.api_key,
        function (err) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "POST /invoice",
                        title: "Database error",
                        detail: err.message
                    }
                });
            }

            invoices.getInvoice(res, body.api_key, this.lastID, 201);
        });
    }
};

module.exports = invoices;
