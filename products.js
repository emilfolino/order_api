const db = require("./database.js")

module.exports = (function () {
    function getAllProducts (res, api_key) {
        db.all("SELECT * FROM products WHERE apiKey = ?", api_key, function (err, rows) {
            res.json(rows)
        })
    }

    function getProduct (res, api_key, product_id) {
        db.all("SELECT * FROM products WHERE apiKey = ? AND productId = ?", api_key, product_id, function (err, row) {
            res.json(row)
        })
    }

    return {
        getAllProducts : getAllProducts,
        getProduct : getProduct,
    }
}())
