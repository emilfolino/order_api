const db = require("./database.js")

module.exports = (function () {
    const dataFields = "orderId as id, customerName as name, customerAddress as address, customerZip as zip, customerCity as city, customerCountry as country"

    function getAllOrders (res, api_key) {
        let orders = { data: []}
        db.all("SELECT " + dataFields + " FROM orders WHERE apiKey = ?", api_key, (err, orderRows) => {
            orderRows.forEach(function(order, count) {
                db.all("SELECT oi.productId as product_id, oi.amount, p.articleNumber as article_number, p.productName as name, p.productDescription as description, p.productSpecifiers as specifiers, p.stock, p.location FROM order_items oi INNER JOIN products p ON oi.productId=p.productId AND oi.apiKey=p.apiKey WHERE oi.apiKey = ? AND oi.orderId = ?", api_key, order.id, (err, orderItemRows) => {
                    order.order_items = orderItemRows;
                    orders.data.push(order);

                    if (orders.data.length === orderRows.length) {
                        res.json(orders);
                    }
                })
            })
        })
    }

    function getOrder (res, api_key, order_id) {
        db.get("SELECT " + dataFields + " FROM orders WHERE apiKey = ? AND orderId = ?", api_key, order_id, (err, order) => {
            order.order_items = [];
            db.each("SELECT oi.productId as product_id, oi.amount, p.articleNumber as article_number, p.productName as name, p.productDescription as description, p.productSpecifiers as specifiers, p.stock, p.location FROM order_items oi INNER JOIN products p ON oi.productId=p.productId AND oi.apiKey=p.apiKey WHERE oi.apiKey = ? AND oi.orderId = ?", api_key, order.id, (err, orderItemRow) => {
                order.order_items.push(orderItemRow);
            }, function () {
                res.json({ data: order });
            });
        })
    }

    function searchOrder (res, api_key, query) {
        const search_query = "%" + query + "%"
        let orders = { data: []}
        db.all("SELECT " + dataFields + " FROM orders WHERE apiKey = ? AND (customerName LIKE ? OR customerAddress LIKE ? OR customerZip LIKE ? OR customerCity LIKE ? OR customerCountry LIKE ?)", api_key, search_query, search_query, (err, orderRows) => {
            orderRows.forEach(function(order, count) {
                db.all("SELECT oi.productId as product_id, oi.amount, p.articleNumber as article_number, p.productName as name, p.productDescription as description, p.productSpecifiers as specifiers, p.stock, p.location FROM order_items oi INNER JOIN products p ON oi.productId=p.productId AND oi.apiKey=p.apiKey WHERE oi.apiKey = ? AND oi.orderId = ?", api_key, order.id, (err, orderItemRows) => {
                    order.order_items = orderItemRows;
                    orders.data.push(order);

                    if (orders.data.length === orderRows.length) {
                        res.json(orders);
                    }
                })
            })
        })
    }

    // function addProduct (res, body) {
    //     db.run("INSERT INTO products (productId, articleNumber, productName, productDescription, productSpecifiers, apiKey) VALUES (?, ?, ?, ?, ?, ?)", body.id, body.article_number, body.name, body.description, body.specifiers, body.api_key, (err) => {
    //         if (err) res.status(400).json({ errors : { status : 400, detail : err.message } })
    //     })
    // }
    //
    // function updateProduct (res, body) {
    //     db.run("INSERT INTO products (productId, articleNumber, productName, productDescription, productSpecifiers, apiKey) VALUES (?, ?, ?, ?, ?, ?)", body.id, body.article_number, body.name, body.description, body.specifiers, body.api_key, (err) => {
    //         if (err) res.status(400).json({ errors : { status : 400, detail : err.message } })
    //     })
    // }
    //
    // function deleteProduct (res, body) {
    //     db.run("INSERT INTO products (productId, articleNumber, productName, productDescription, productSpecifiers, apiKey) VALUES (?, ?, ?, ?, ?, ?)", body.id, body.article_number, body.name, body.description, body.specifiers, body.api_key, (err) => {
    //         if (err) res.status(400).json({ errors : { status : 400, detail : err.message } })
    //     })
    // }

    return {
        getAllOrders: getAllOrders,
        getOrder: getOrder,
        searchOrder: searchOrder,
    }
}())
