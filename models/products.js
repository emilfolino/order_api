const db = require("../db/database.js");

module.exports = (function () {
    const dataFields = "productId as id, articleNumber as article_number," +
        " productName as name, productDescription as description," +
        " productSpecifiers as specifiers, stock, location";

    function getAllProducts(res, apiKey) {
        db.all("SELECT " + dataFields + " FROM products WHERE apiKey = ?",
            apiKey, (err, rows) => {
                if (err) {
                    res.status(401).json({
                        errors: {
                            status: 401,
                            source: "/products",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                    return;
                }

                res.json( { data: rows } );
            });
    }

    function getProduct(res, apiKey, productId) {
        db.get("SELECT " + dataFields + " FROM products WHERE apiKey = ? AND productId = ?",
            apiKey,
            productId, (err, row) => {
                if (err) {
                    res.status(401).json({
                        errors: {
                            status: 401,
                            source: "/product/:product_id",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                    return;
                }

                res.json( { data: row } );
            });
    }

    function searchProduct(res, apiKey, query) {
        const searchQuery = "%" + query + "%";

        db.all("SELECT " + dataFields + " FROM products WHERE apiKey = ? AND" +
            " (productName LIKE ? OR productDescription LIKE ?)",
        apiKey,
        searchQuery,
        searchQuery, (err, rows) => {
            if (err) {
                res.status(401).json({
                    errors: {
                        status: 401,
                        source: "/product/search/:query",
                        title: "Database error",
                        detail: err.message
                    }
                });
                return;
            }

            res.json( { data: rows } );
        });
    }

    function addProduct(res, body) {
        db.run("INSERT INTO products (productId, articleNumber, productName," +
            " productDescription, productSpecifiers, stock, location, apiKey)" +
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        body.id,
        body.article_number,
        body.name,
        body.description,
        body.specifiers,
        body.stock,
        body.location,
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

    function updateProduct(res, body) {
        if (Number.isInteger(body.id)) {
            db.run("UPDATE products SET articleNumber = ?, productName = ?," +
                " productDescription = ?, specifiers = ?, stock = ?, location = ?" +
                " WHERE apiKey = ? AND productId = ?",
            body.article_number,
            body.name,
            body.description,
            body.specifiers,
            body.stock,
            body.location,
            body.api_key,
            body.id, (err) => {
                if (err) {
                    res.status(400).json({ errors: { status: 400, detail: err.message } });
                } else {
                    res.status(204).send();
                }
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
    }

    function deleteProduct(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            db.run("DELETE FROM products WHERE apiKey = ? AND productId = ?",
                body.api_key,
                body.id, (err) => {
                    if (err) {
                        res.status(400).json({ errors: { status: 400, detail: err.message } });
                    } else {
                        res.status(204).send();
                    }
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
    }

    return {
        getAllProducts: getAllProducts,
        getProduct: getProduct,
        searchProduct: searchProduct,
        addProduct: addProduct,
        updateProduct: updateProduct,
        deleteProduct: deleteProduct,
    };
}());
