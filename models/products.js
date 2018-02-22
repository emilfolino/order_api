const db = require("../db/database.js");

module.exports = (function () {
    const dataFields = "productId as id, articleNumber as article_number," +
        " productName as name, productDescription as description," +
        " productSpecifiers as specifiers, stock, location, (price / 100) as price";

    function getAllProducts(res, apiKey, status=200) {
        db.all("SELECT " + dataFields + " FROM products WHERE apiKey = ?",
            apiKey, (err, rows) => {
                if (err) {
                    return errorResponse(res, "/products", err);
                }

                res.status(status).json( { data: rows } );
            });
    }

    function getProduct(res, apiKey, productId) {
        if (Number.isInteger(parseInt(productId))) {
            db.get("SELECT " + dataFields + " FROM products WHERE apiKey = ? AND productId = ?",
                apiKey,
                productId, (err, row) => {
                    if (err) {
                        return errorResponse(res, "/product/:product_id", err);
                    }

                    res.json( { data: row } );
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
    }

    function searchProduct(res, apiKey, query) {
        const searchQuery = "%" + query + "%";

        db.all("SELECT " + dataFields + " FROM products WHERE apiKey = ? AND" +
            " (productName LIKE ? OR productDescription LIKE ?)",
        apiKey,
        searchQuery,
        searchQuery, (err, rows) => {
            if (err) {
                return errorResponse(res, "/product/search/:query", err);
            }

            res.json( { data: rows } );
        });
    }

    function addProduct(res, body) {
        db.run("INSERT INTO products (productId, articleNumber, productName," +
            " productDescription, productSpecifiers, stock, location, price, apiKey)" +
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        body.id,
        body.article_number,
        body.name,
        body.description,
        body.specifiers,
        body.stock,
        body.location,
        parseInt(body.price) * 100,
        body.api_key, (err) => {
            if (err) {
                return errorResponse(res, "/product/search/:query", err);
            }

            res.status(201).json({ data: body });
        });
    }

    function updateProduct(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            db.run("UPDATE products SET articleNumber = ?, productName = ?," +
                " productDescription = ?, productSpecifiers = ?, stock = ?, location = ?, price = ?" +
                " WHERE apiKey = ? AND productId = ?",
            body.article_number,
            body.name,
            body.description,
            body.specifiers,
            body.stock,
            body.location,
            parseInt(body.price) * 100,
            body.api_key,
            body.id, (err) => {
                if (err) {
                    return errorResponse(res, "/product", err);
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
    }

    function deleteProduct(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            db.run("DELETE FROM products WHERE apiKey = ? AND productId = ?",
                body.api_key,
                body.id, (err) => {
                    if (err) {
                        return errorResponse(res, "/product", err);
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
    }

    function errorResponse(res, path, err) {
        return res.status(401).json({
            errors: {
                status: 401,
                source: path,
                title: "Database error",
                detail: err.message
            }
        });
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
