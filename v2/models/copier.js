const db = require("../db/database.js");
const products = require("./products.js");
const orders = require("./orders.js");

let config;

try {
    config = require('../../config/config.json');
} catch (error) {
    console.error(error);
}


const copier = {
    copyApiKey: process.env.COPY_API_KEY || config.copyApiKey,

    copyAll: function(res, apiKey) {
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

                            db.all("SELECT * FROM " +
                                "(SELECT " + orders.dataFields +
                                " FROM orders o" +
                                " INNER JOIN status s ON s.id = o.statusId" +
                                " WHERE o.apiKey = ?" +
                                " ORDER BY o.ROWID DESC LIMIT " +
                                parseInt(this.changes) + ")" +
                                " ORDER BY id ASC",
                            apiKey,
                            (err, orderRows) => {
                                if (err) {
                                    return res.status(500).json({
                                        errors: {
                                            status: 500,
                                            source: "/orders",
                                            title: "Database error",
                                            detail: err.message
                                        }
                                    });
                                }

                                let copiedOrders = orderRows;

                                let oisql = " SELECT orderId," +
                                    " productId," +
                                    " amount " +
                                    " FROM order_items" +
                                    " WHERE apiKey = ?";

                                db.all(oisql,
                                    copier.copyApiKey,
                                    function (err, oiRows) {
                                        if (err) {
                                            return res.status(500).json({
                                                errors: {
                                                    status: 500,
                                                    source: "/copy_orders",
                                                    title: "Database error in order_items",
                                                    detail: err.message
                                                }
                                            });
                                        }

                                        return copier.organizeOrderItems(
                                            res,
                                            apiKey,
                                            copiedProducts,
                                            copiedOrders,
                                            oiRows
                                        );
                                    });
                            });
                        });
                });
            });
    },

    organizeOrderItems: function(
        res,
        apiKey,
        copiedProducts,
        copiedOrders,
        orderItems
    ) {
        let sqlReadyOrderItems = [];

        orderItems.forEach(function(orderItem) {
            orderItem.orderId = copiedOrders[orderItem.orderId - 1].id;
            orderItem.productId = copiedProducts[orderItem.productId - 1].id;

            sqlReadyOrderItems.push(
                `(${orderItem.orderId}, ${orderItem.productId}, ${orderItem.amount}, '${apiKey}')`
            );
        });

        let sql = "INSERT INTO order_items" +
            " (orderId, productId, amount, apiKey)" +
            " VALUES " + sqlReadyOrderItems.join(", ");

        db.run(sql, (err) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/copy_all",
                        title: "Database error in insert order_items",
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

            return orders.getAllOrders(res, apiKey, 201, copyResponse);
        });
    },

    copyProducts: function(res, apiKey) {
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
};

module.exports = copier;
