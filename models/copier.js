const db = require("../db/database.js");
const products = require("./products.js");
const orders = require("./orders.js");
const config = require('../config/config.json');

const copier = (function () {
    const copyApiKey = config.copyApiKey;

    function copyAll(res, apiKey) {
        let sql = "INSERT INTO products" +
            " (productId," +
            " articleNumber," +
            " productName," +
            " productDescription," +
            " productSpecifiers," +
            " stock," +
            " location," +
            " price," +
            " apiKey)" +
            " SELECT productId," +
            " articleNumber," +
            " productName," +
            " productDescription," +
            " productSpecifiers," +
            " stock," +
            " location, " +
            " price," +
            "'" + apiKey + "'" +
            " FROM products" +
            " WHERE apiKey = ?";

        db.run(sql, copyApiKey, (err) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/copy_products",
                        title: "Database error",
                        detail: err.message
                    }
                });
            } else {
                let sql = "INSERT INTO orders" +
                    " (orderId," +
                    " customerName," +
                    " customerAddress," +
                    " customerZip," +
                    " customerCity," +
                    " customerCountry," +
                    " statusId," +
                    " apiKey)" +
                    " SELECT orderId," +
                    " customerName," +
                    " customerAddress," +
                    " customerZip," +
                    " customerCity," +
                    " customerCountry," +
                    " statusId," +
                    "'" + apiKey + "'" +
                    " FROM orders" +
                    " WHERE apiKey = ?";

                db.run(sql, copyApiKey, (err) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/copy_orders",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    } else {
                        let orderItemsSQL = "INSERT INTO order_items" +
                            " (orderId," +
                            " productId," +
                            " amount," +
                            " apiKey)" +
                            " SELECT orderId," +
                            " productId," +
                            " amount," +
                            "'" + apiKey + "'" +
                            " FROM order_items" +
                            " WHERE apiKey = ?";

                        db.run(orderItemsSQL, copyApiKey, (err) => {
                            if (err) {
                                return res.status(500).json({
                                    errors: {
                                        status: 500,
                                        source: "/copy_orders",
                                        title: "Database error in order_items",
                                        detail: err.message
                                    }
                                });
                            } else {
                                return res.status(201).json({
                                    data: {
                                        message: "Products and orders have been copied"
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    function copyProducts(res, apiKey) {
        let sql = "INSERT INTO products" +
            " (productId," +
            " articleNumber," +
            " productName," +
            " productDescription," +
            " productSpecifiers," +
            " stock," +
            " location," +
            " price," +
            " apiKey)" +
            " SELECT productId," +
            " articleNumber," +
            " productName," +
            " productDescription," +
            " productSpecifiers," +
            " stock," +
            " location, " +
            " price," +
            "'" + apiKey + "'" +
            " FROM products" +
            " WHERE apiKey = ?";

        db.run(sql, copyApiKey, (err) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/copy_products",
                        title: "Database error",
                        detail: err.message
                    }
                });
            } else {
                products.getAllProducts(res, apiKey, 201);
            }
        });
    }

    function copyOrders(res, apiKey) {
        let sql = "INSERT INTO orders" +
            " (orderId," +
            " customerName," +
            " customerAddress," +
            " customerZip," +
            " customerCity," +
            " customerCountry," +
            " statusId," +
            " apiKey)" +
            " SELECT orderId," +
            " customerName," +
            " customerAddress," +
            " customerZip," +
            " customerCity," +
            " customerCountry," +
            " statusId," +
            "'" + apiKey + "'" +
            " FROM orders" +
            " WHERE apiKey = ?";

        db.run(sql, copyApiKey, (err) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/copy_orders",
                        title: "Database error",
                        detail: err.message
                    }
                });
            } else {
                let orderItemsSQL = "INSERT INTO order_items" +
                    " (orderId," +
                    " productId," +
                    " amount," +
                    " apiKey)" +
                    " SELECT orderId," +
                    " productId," +
                    " amount," +
                    "'" + apiKey + "'" +
                    " FROM order_items" +
                    " WHERE apiKey = ?";

                db.run(orderItemsSQL, copyApiKey, (err) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/copy_orders",
                                title: "Database error in order_items",
                                detail: err.message
                            }
                        });
                    } else {
                        orders.getAllOrders(res, apiKey, 201);
                    }
                });
            }
        });
    }

    return {
        copyAll: copyAll,
        copyProducts: copyProducts,
        copyOrders: copyOrders,
    };
}());

module.exports = copier;
