const db = require("../db/database.js");

const products = {
    allowedFields: {
        article_number: "articleNumber",
        name: "productName",
        description: "productDescription",
        specifiers: "productSpecifiers",
        stock: "stock",
        location: "location",
        price: "price",
        image_url: "image_url",
        category: "category",
    },

    dataFields: "ROWID as id, articleNumber as article_number," +
        " productName as name, productDescription as description," +
        " productSpecifiers as specifiers, stock, location, (price / 100) as price," +
        " image_url, category",

    getAllProducts: function(res, apiKey, status=200) {
        db.all("SELECT " + products.dataFields + " FROM products WHERE apiKey LIKE ?",
            apiKey, (err, rows) => {
                if (err) {
                    return products.errorResponse(res, "/products", err);
                }

                return res.status(status).json( { data: rows } );
            });
    },

    getProduct: function(res, apiKey, productId, status=200) {
        if (Number.isInteger(parseInt(productId))) {
            db.get(
                "SELECT " +
                products.dataFields +
                " FROM products WHERE apiKey = ? AND ROWID = ?",
                apiKey,
                productId, (err, row) => {
                    if (err) {
                        return products.errorResponse(res, "/product/:product_id", err);
                    }

                    res.status(status).json( { data: row } );
                });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute product id " +
                        " is not an integer."
                }
            });
        }
    },

    searchProduct: function(res, apiKey, query) {
        const searchQuery = "%" + query + "%";

        db.all("SELECT " + products.dataFields + " FROM products WHERE apiKey = ? AND" +
            " (productName LIKE ? OR productDescription LIKE ?)",
        apiKey,
        searchQuery,
        searchQuery, (err, rows) => {
            if (err) {
                return products.errorResponse(res, "/product/search/:query", err);
            }

            res.json( { data: rows } );
        });
    },

    addProduct: function(res, body) {
        db.run("INSERT INTO products (articleNumber, productName," +
            " productDescription, productSpecifiers, stock, location, price, apiKey)" +
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        body.article_number,
        body.name,
        body.description,
        body.specifiers,
        body.stock,
        body.location,
        parseInt(body.price) * 100,
        body.api_key,
        function(err) {
            if (err) {
                return products.errorResponse(res, "POST /product", err);
            }

            products.getProduct(res, body.api_key, this.lastID, 201);
        });
    },

    updateProduct: function(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            let params = [];
            let sql = "UPDATE products SET ";
            let updateFields = [];

            for (const field in products.allowedFields) {
                if (body[field] !== undefined) {
                    updateFields.push(products.allowedFields[field] + " = ?");

                    if (field == "price") {
                        body[field] *= 100;
                    }

                    params.push(body[field]);
                }
            }

            sql += updateFields.join(", ");
            sql += " WHERE apiKey = ? AND ROWID = ?";

            params.push(body.api_key, body.id);

            db.run(
                sql,
                params,
                function (err) {
                    if (err) {
                        return products.errorResponse(res, "/product", err);
                    }

                    res.status(204).send();
                });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute product id (id)" +
                        " was not included in the request."
                }
            });
        }
    },

    deleteProduct: function(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            db.run("DELETE FROM products WHERE apiKey = ? AND ROWID = ?",
                body.api_key,
                body.id, (err) => {
                    if (err) {
                        return products.errorResponse(res, "/product", err);
                    }

                    res.status(204).send();
                });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute product id (id)" +
                        " was not included in the request."
                }
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
    },

    everything: function(res) {
        db.all(
            "SELECT " + products.dataFields + " FROM products", (err, rows) => {
                if (err) {
                    return products.errorResponse(res, "/products/everything", err);
                }

                return res.status(200).json( { data: rows } );
            });
    }
};

module.exports = products;
