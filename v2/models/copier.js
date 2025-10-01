const db = require("../db/database.js");
const products = require("./products.js");

const copier = {
    copyApiKey: process.env.COPY_API_KEY,

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
