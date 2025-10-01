const db = require("../db/database.js");
const products = require("./products.js");
const orders = require("./orders.js");

const copier = {
    copyApiKey: process.env.COPY_API_KEY,

    copyAll: function(res, apiKey) {
        if (apiKey === copier.copyApiKey) {
            var err = { message: "Cannot copy that API-key." };

            return copier.errorResponse(res, "/v2/copier/reset", err);
        } else {
            let sql = "INSERT INTO products" +
                " (articleNumber," +
                " productName," +
                " productDescription," +
                " productSpecifiers," +
                " stock," +
                " location," +
                " price," +
                " apiKey)" +
                " SELECT articleNumber," +
                " productName," +
                " productDescription," +
                " productSpecifiers," +
                " stock," +
                " location, " +
                " price," +
                "'" + apiKey + "'" +
                " FROM products" +
                " WHERE apiKey = ?";

            db.run(sql,
                copier.copyApiKey,
                function (err) {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/copy_products",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }

                    let productChanges = this.changes;
                    let productLast = this.lastID;

                    db.all("SELECT * FROM " +
                        "(SELECT " + products.dataFields +
                        " FROM products WHERE apiKey = ?" +
                        " ORDER BY ROWID DESC LIMIT " +
                        parseInt(this.changes) + ")" +
                        " ORDER BY id ASC",
                    apiKey,
                    (err, rows) => {
                        if (err) {
                            return res.status(500).json({
                                errors: {
                                    status: 500,
                                    source: "/copy_products",
                                    title: "Database error",
                                    detail: err.message
                                }
                            });
                        }

                        let copiedProducts = rows;

                        let sql = "INSERT INTO orders" +
                            " (customerName," +
                            " customerAddress," +
                            " customerZip," +
                            " customerCity," +
                            " customerCountry," +
                            " statusId," +
                            " apiKey)" +
                            " SELECT customerName," +
                            " customerAddress," +
                            " customerZip," +
                            " customerCity," +
                            " customerCountry," +
                            " statusId," +
                            "'" + apiKey + "'" +
                            " FROM orders" +
                            " WHERE apiKey = ?";

                        db.run(sql,
                            copier.copyApiKey,
                            function (err) {
                                if (err) {
                                    return res.status(500).json({
                                        errors: {
                                            status: 500,
                                            source: "/copy_orders",
                                            title: "Database error",
                                            detail: err.message
                                        }
                                    });
                                }

                                let copyResponse = {
                                    data: {
                                        products: copiedProducts,
                                        orders: []
                                    }
                                };

                                let productOffset = productLast - productChanges;
                                let orderOffset = this.lastID - this.changes;

                                let range = {
                                    min: orderOffset + 1,
                                    max: this.lastID,
                                };

                                let oisql = `INSERT INTO order_items
                                    (orderId, productId, amount, apiKey)
                                    SELECT (orderId + ${orderOffset}),
                                    (productId + ${productOffset}),
                                    amount,
                                    '${apiKey}'
                                    FROM order_items WHERE apiKey = ?`;

                                db.run(
                                    oisql,
                                    copier.copyApiKey,
                                    function (err) {
                                        if (err) {
                                            return res.status(500).json({
                                                errors: {
                                                    status: 500,
                                                    source: "/copy_orders",
                                                    title: "Database error",
                                                    detail: err.message
                                                }
                                            });
                                        }

                                        return orders.getAllOrders(
                                            res,
                                            apiKey,
                                            201,
                                            copyResponse,
                                            range,
                                        );
                                    });
                            });
                    });
                });
        }
    },

    copyProducts: function(res, apiKey) {
        if (apiKey === copier.copyApiKey) {
            var err = { message: "Cannot copy that API-key." };

            return copier.errorResponse(res, "/v2/copier/reset", err);
        } else {
            let sql = "INSERT INTO products" +
                " (articleNumber," +
                " productName," +
                " productDescription," +
                " productSpecifiers," +
                " stock," +
                " location," +
                " price," +
                " apiKey)" +
                " SELECT articleNumber," +
                " productName," +
                " productDescription," +
                " productSpecifiers," +
                " stock," +
                " location, " +
                " price," +
                " '" + apiKey + "'" +
                " FROM products" +
                " WHERE apiKey = ?";

            db.run(sql,
                copier.copyApiKey,
                function (err) {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/copy_products",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }

                    db.all("SELECT * FROM " +
                        "(SELECT " + products.dataFields +
                        " FROM products WHERE apiKey = ?" +
                        " ORDER BY ROWID DESC LIMIT " +
                        parseInt(this.changes) + ")" +
                        " ORDER BY id ASC",
                    apiKey,
                    (err, rows) => {
                        if (err) {
                            return res.status(500).json({
                                errors: {
                                    status: 500,
                                    source: "/copy_products",
                                    title: "Database error",
                                    detail: err.message
                                }
                            });
                        }

                        res.status(201).json( { data: rows } );
                    });
                });
        }
    },

    reset: function(res, apiKey) {
        if (apiKey === copier.copyApiKey) {
            var err = { message: "Cannot reset that API-key." };

            return copier.errorResponse(res, "/v2/copier/reset", err);
        } else {
            db.run("DELETE FROM products WHERE apiKey=?", apiKey, (err) => {
                if (err) {
                    return copier.errorResponse(res, "/v2/copier/reset", err);
                }

                db.run("DELETE FROM orders WHERE apiKey=?", apiKey, (err) => {
                    if (err) {
                        return copier.errorResponse(res, "/v2/copier/reset", err);
                    }

                    db.run("DELETE FROM order_items WHERE apiKey=?", apiKey, (err) => {
                        if (err) {
                            return copier.errorResponse(res, "/v2/copier/reset", err);
                        }

                        db.run("DELETE FROM deliveries WHERE apiKey=?", apiKey, (err) => {
                            if (err) {
                                return copier.errorResponse(res, "/v2/copier/reset", err);
                            }

                            db.run("DELETE FROM invoices WHERE apiKey=?", apiKey, (err) => {
                                if (err) {
                                    return copier.errorResponse(res, "/v2/copier/reset", err);
                                }

                                db.run("DELETE FROM users WHERE apiKey=?", apiKey, (err) => {
                                    if (err) {
                                        return copier.errorResponse(res, "/v2/copier/reset", err);
                                    }

                                    return copier.copyAll(res, apiKey);
                                });
                            });
                        });
                    });
                });
            });
        }
    },

    errorResponse: function(res, path, err) {
        return res.status(500).json({
            errors: {
                status: 500,
                source: path,
                title: "Database error",
                detail: err.message
            }
        });
    }
};

module.exports = copier;
