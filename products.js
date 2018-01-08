const db = require("./database.js")

module.exports = (function () {
    const data_fields = "productId as id, articleNumber as article_number, productName as name, productDescription as description, productSpecifiers as specifiers, stock, location"

    function getAllProducts (res, api_key) {
        db.all("SELECT " + data_fields + " FROM products WHERE apiKey = ?", api_key, (err, rows) => res.json( { data : rows } ))
    }

    function getProduct (res, api_key, product_id) {
        db.get("SELECT " + data_fields + " FROM products WHERE apiKey = ? AND productId = ?", api_key, product_id, (err, row) => res.json( { data : row } ))
    }

    function searchProduct (res, api_key, query) {
        const search_query = "%" + query + "%"
        db.all("SELECT " + data_fields + " FROM products WHERE apiKey = ? AND (productName LIKE ? OR productDescription LIKE ?)", api_key, search_query, search_query, (err, rows) => res.json( { data : rows } ))
    }

    function addProduct (res, body) {
        db.run("INSERT INTO products (productId, articleNumber, productName, productDescription, productSpecifiers, apiKey) VALUES (?, ?, ?, ?, ?, ?)", body.id, body.article_number, body.name, body.description, body.specifiers, body.api_key, (err) => {
            if (err) res.status(400).json({ errors : { status : 400, detail : err.message } })
        })
    }

    return {
        getAllProducts : getAllProducts,
        getProduct : getProduct,
        searchProduct : searchProduct,
        addProduct : addProduct,
    }
}())
