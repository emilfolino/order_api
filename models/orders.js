const db = require("../db/database.js");

module.exports = (function () {
    const dataFields = "o.ROWID as id, customerName as name," +
        " customerAddress as address," +
        " customerZip as zip, customerCity as city," +
        " customerCountry as country, s.status, s.id as status_id";

    const orderItemsDataFields = "oi.productId as product_id, oi.amount," +
        " p.articleNumber as article_number, p.productName as name," +
        " p.productDescription as description, p.productSpecifiers as specifiers," +
        " p.stock, p.location, (p.price/100) as price";

    function getAllOrders(res, apiKey, status=200) {
        let orders = { data: []};

        db.all("SELECT " + dataFields +
            " FROM orders o INNER JOIN status s ON s.id = o.statusId" +
            " WHERE o.apiKey = ?",
        apiKey, (err, orderRows) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/orders",
                        title: "Database error",
                        detail: err.message
                    }
                });
            }

            if (orderRows.length === 0) {
                return res.status(status).json(orders);
            }

            orderRows.forEach(function(order) {
                db.all("SELECT " + orderItemsDataFields + " FROM order_items oi " +
                    "INNER JOIN products p ON oi.productId=p.ROWID AND oi.apiKey=p.apiKey" +
                    " WHERE oi.apiKey = ? AND oi.orderId = ?",
                apiKey,
                order.id, (err, orderItemRows) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/orders order_items",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }

                    order.order_items = orderItemRows;
                    orders.data.push(order);

                    if (orders.data.length === orderRows.length) {
                        res.status(status).json(orders);
                    }
                });
            });
        });
    }

    function getOrder(res, apiKey, orderId) {
        if (Number.isInteger(parseInt(orderId))) {
            db.get("SELECT " + dataFields +
                " FROM orders o INNER JOIN status s ON s.id = o.statusId" +
                " WHERE o.apiKey = ? AND orderId = ?",
            apiKey,
            orderId, (err, order) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/order/" + orderId,
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                if (order === undefined) {
                    return res.json({ data: {} });
                }

                order.order_items = [];
                db.each("SELECT " + orderItemsDataFields + " FROM order_items oi " +
                    " INNER JOIN products p ON oi.productId=p.ROWID" +
                    " AND oi.apiKey=p.apiKey" +
                    " WHERE oi.apiKey = ? AND oi.orderId = ?",
                apiKey,
                order.id, (err, orderItemRow) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/order/" + orderId + " order_items",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }

                    order.order_items.push(orderItemRow);
                }, function () {
                    res.json({ data: order });
                });
            });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute order id " +
                        " is not an integer."
                }
            });
        }
    }

    function searchOrder(res, apiKey, query) {
        const searchQuery = "%" + query + "%";
        let orders = { data: []};

        db.all("SELECT " + dataFields +
            " FROM orders o INNER JOIN status s ON s.id = o.statusId" +
            " WHERE o.apiKey = ? AND" +
            "(customerName LIKE ? OR customerAddress LIKE ? OR customerZip LIKE ?" +
            " OR customerCity LIKE ? OR customerCountry LIKE ?)",
        apiKey,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery, (err, orderRows) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/order/search/" + query,
                        title: "Database error",
                        detail: err.message
                    }
                });
            }

            if (orderRows.length === 0) {
                return res.json(orders);
            }

            orderRows.forEach(function(order) {
                db.all("SELECT " + orderItemsDataFields + " FROM order_items oi " +
                    " INNER JOIN products p ON oi.productId=p.ROWID" +
                    " AND oi.apiKey=p.apiKey WHERE oi.apiKey = ? AND oi.orderId = ?",
                apiKey,
                order.id, (err, orderItemRows) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/order/search/" + query + " order_items",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }

                    order.order_items = orderItemRows;
                    orders.data.push(order);

                    if (orders.data.length === orderRows.length) {
                        res.json(orders);
                    }
                });
            });
        });
    }

    function addOrder(res, body) {
        db.run("INSERT INTO orders (orderId, customerName, customerAddress, customerZip," +
            " customerCity, customerCountry, statusId, apiKey) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        body.id,
        body.name,
        body.address,
        body.zip,
        body.city,
        body.country,
        body.status_id || 100,
        body.api_key, (err) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "POST /order",
                        title: "Database error",
                        detail: err.message
                    }
                });
            } else {
                res.status(201).json({ data: body });
            }
        });
    }

    function updateOrder(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            db.run("UPDATE orders SET customerName = ?, customerAddress = ?, customerZip = ?," +
                " customerCity = ?, customerCountry = ?, statusId = ?" +
                " WHERE apiKey = ? AND orderId = ?",
            body.name,
            body.address,
            body.zip,
            body.city,
            body.country,
            body.status_id || 100,
            body.api_key,
            body.id, (err) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "PUT /order",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                } else {
                    res.status(204).send();
                }
            });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute order id (id) " +
                        " was not included in the request."
                }
            });
        }
    }

    function deleteOrder(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            db.run("DELETE FROM orders WHERE apiKey = ? AND orderId = ?",
                body.api_key,
                body.id, (err) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "DELETE /order",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    } else {
                        db.run("DELETE FROM order_items WHERE apiKey = ? AND orderId = ?",
                            body.api_key,
                            body.id, (err) => {
                                if (err) {
                                    return res.status(500).json({
                                        errors: {
                                            status: 500,
                                            source: "DELETE /order order_items",
                                            title: "Database error",
                                            detail: err.message
                                        }
                                    });
                                } else {
                                    res.status(204).send();
                                }
                            });
                    }
                });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute order id (id) " +
                        " was not included in the request."
                }
            });
        }
    }

    return {
        getAllOrders: getAllOrders,
        getOrder: getOrder,
        searchOrder: searchOrder,
        addOrder: addOrder,
        updateOrder: updateOrder,
        deleteOrder: deleteOrder,
    };
}());
