const db = require("../db/database.js");
const products = require("./products.js");
const orders = require("./orders.js");

const copier = (function () {
    const copyApiKey = "fdc42b2d941e8c6f7b38d974df3758ce";

    function copyAll(res, apiKey) {
        copyProductsHelper(res, apiKey, false);
        copyOrdersHelper(res, apiKey, false);

        res.status(201).json({
            data: {
                message: "Products and orders have been copied"
            }
        });
    }

    function copyProducts(res, apiKey) {
        copyProductsHelper(res, apiKey);
    }

    function copyProductsHelper(res, apiKey, sendResponse=true) {
        let sql = "INSERT INTO products" +
            " (productId," +
            " articleNumber," +
            " productName," +
            " productDescription," +
            " productSpecifiers," +
            " stock," +
            " location," +
            " apiKey)" +
            " SELECT productId," +
            " articleNumber," +
            " productName," +
            " productDescription," +
            " productSpecifiers," +
            " stock," +
            " location, " +
            "'" + apiKey + "'" +
            " FROM products" +
            " WHERE apiKey = ?";

        db.run(sql, copyApiKey, (err) => {
            if (err) {
                res.status(400).json({
                    errors: {
                        status: 400,
                        detail: err.message
                    }
                });
            } else {
                if (sendResponse) {
                    products.getAllProducts(res, apiKey, 201);
                }
            }
        });
    }

    function copyOrders(res, apiKey) {
        copyOrdersHelper(res, apiKey);
    }

    function copyOrdersHelper(res, apiKey, sendResponse=true) {
        let sql = "INSERT INTO orders" +
            " (orderId," +
            " customerName," +
            " customerAddress," +
            " customerZip," +
            " customerCity," +
            " customerCountry," +
            " apiKey)" +
            " SELECT orderId," +
            " customerName," +
            " customerAddress," +
            " customerZip," +
            " customerCity," +
            " customerCountry," +
            "'" + apiKey + "'" +
            " FROM orders" +
            " WHERE apiKey = ?";

        db.run(sql, copyApiKey, (err) => {
            if (err) {
                res.status(400).json({
                    errors: {
                        status: 400,
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
                        res.status(400).json({
                            errors: {
                                status: 400,
                                detail: err.message
                            }
                        });
                    } else {
                        if (sendResponse) {
                            orders.getAllOrders(res, apiKey, 201);
                        }
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
