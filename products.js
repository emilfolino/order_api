const db = require("./database.js")

module.exports = (function () {
    const dataFields = "productId as id, articleNumber as article_number, productName as name, productDescription as description, productSpecifiers as specifiers, stock, location"

    function getAllProducts(res, api_key) {
        db.all("SELECT " + dataFields + " FROM products WHERE apiKey = ?", api_key, (err, rows) => res.json( { data : rows } ))
    }

    function getProduct(res, api_key, product_id) {
        db.get("SELECT " + dataFields + " FROM products WHERE apiKey = ? AND productId = ?", api_key, product_id, (err, row) => res.json( { data : row } ))
    }

    function searchProduct(res, api_key, query) {
        const search_query = "%" + query + "%"
        db.all("SELECT " + dataFields + " FROM products WHERE apiKey = ? AND (productName LIKE ? OR productDescription LIKE ?)", api_key, search_query, search_query, (err, rows) => res.json( { data : rows } ))
    }

    function addProduct(res, body) {
        db.run("INSERT INTO products (productId, articleNumber, productName, productDescription, productSpecifiers, stock, location, apiKey) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", body.id, body.article_number, body.name, body.description, body.specifiers, body.stock, body.location, body.api_key, (err) => {
            if (err) {
                res.status(400).json({ errors: { status: 400, detail: err.message } })
            } else {
                res.status(201).json({ data: body })
            }
        })
    }

    function updateProduct(res, body) {
        if (Number.isInteger(body.id)) {
            db.run("UPDATE products SET articleNumber = ?, productName = ?, productDescription = ?, specifiers = ?, stock = ?, location = ? WHERE apiKey = ? AND productId = ?", body.article_number, body.name, body.description, body.specifiers, body.stock, body.location, body.api_key, body.id, (err) => {
                if (err) {
                    res.status(400).json({ errors: { status: 400, detail: err.message } })
                } else {
                    res.status(204).send()
                }
            })
        } else {
            res.status(400).json({ errors: { status: 400, detail: "Required attribute product id (id) was not included in the request." } })
        }
    }

    function deleteProduct(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            db.run("DELETE FROM products WHERE apiKey = ? AND productId = ?", body.api_key, body.id, (err) => {
                if (err) {
                    res.status(400).json({ errors: { status: 400, detail: err.message } })
                } else {
                    res.status(204).send()
                }
            })
        } else {
            res.status(400).json({ errors : { status : 400, detail : "Required attribute product id (id) was not included in the request." } })
        }
    }

    return {
        getAllProducts: getAllProducts,
        getProduct: getProduct,
        searchProduct: searchProduct,
        addProduct: addProduct,
        updateProduct: updateProduct,
        deleteProduct: deleteProduct,
    }
}())
