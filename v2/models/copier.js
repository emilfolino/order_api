const db = require("../db/database.js");
const products = require("./products.js");

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

        db.run(sql, copier.copyApiKey, (err) => {
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

            db.run(sql, copier.copyApiKey, (err) => {
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

                db.run(orderItemsSQL, copier.copyApiKey, (err) => {
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

                    return res.status(201).json({
                        data: {
                            message: "Products and orders have been copied"
                        }
                    });
                });
            });
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
