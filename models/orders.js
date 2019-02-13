const db = require("../db/database.js");

const orders = {
    dataFields: "o.ROWID as id, customerName as name," +
        " customerAddress as address," +
        " customerZip as zip, customerCity as city," +
        " customerCountry as country, s.status, s.id as status_id",

    orderItemsDataFields: "oi.productId as product_id, oi.amount," +
        " p.articleNumber as article_number, p.productName as name," +
        " p.productDescription as description, p.productSpecifiers as specifiers," +
        " p.stock, p.location, (p.price/100) as price",

    getAllOrders: function(res, apiKey, status=200) {
        let returnedOrders = { data: []};

        db.all("SELECT " + orders.dataFields +
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
                return res.status(status).json(returnedOrders);
            }

            return orders.getOrderItems(
                res,
                orderRows,
                apiKey,
                status,
                returnedOrders
            );
        });
    },

    getOrderItems: function(res, orderRows, apiKey, status, returnedOrders) {
        orderRows.forEach(function(order) {
            db.all("SELECT " + orders.orderItemsDataFields + " FROM order_items oi " +
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
                returnedOrders.data.push(order);

                if (returnedOrders.data.length === orderRows.length) {
                    return res.status(status).json(returnedOrders);
                }
            });
        });
    },

    getOrder: function(res, apiKey, orderId, status=200) {
        if (Number.isInteger(parseInt(orderId))) {
            db.get("SELECT " + orders.dataFields +
                " FROM orders o INNER JOIN status s ON s.id = o.statusId" +
                " WHERE o.apiKey = ? AND o.ROWID = ?",
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
                    return res.status(status).json({ data: {} });
                }

                order.order_items = [];
                db.each("SELECT " + orders.orderItemsDataFields + " FROM order_items oi " +
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
                    return res.status(status).json({ data: order });
                });
            });
        } else {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute order id " +
                        " is not an integer."
                }
            });
        }
    },

    searchOrder: function(res, apiKey, query, status=200) {
        const searchQuery = "%" + query + "%";
        let returnedOrders = { data: []};

        db.all("SELECT " + orders.dataFields +
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
                return res.status(status).json(returnedOrders);
            }

            return orders.getOrderItems(
                res,
                orderRows,
                apiKey,
                status,
                returnedOrders
            );
        });
    },

    addOrder: function(res, body) {
        db.run("INSERT INTO orders (customerName, customerAddress, customerZip," +
            " customerCity, customerCountry, statusId, apiKey) VALUES (?, ?, ?, ?, ?, ?, ?)",
        body.name,
        body.address,
        body.zip,
        body.city,
        body.country,
        body.status_id || 100,
        body.api_key,
        function(err) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "POST /order",
                        title: "Database error",
                        detail: err.message
                    }
                });
            }

            return orders.getOrder(res, body.api_key, this.lastID, 201);
        });
    },

    updateOrder: function(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            db.run("UPDATE orders SET customerName = ?," +
                " customerAddress = ?, customerZip = ?," +
                " customerCity = ?, customerCountry = ?, statusId = ?" +
                " WHERE apiKey = ? AND ROWID = ?",
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
                }

                return res.status(204).send();
            });
        } else {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute order id (id) " +
                        " was not included in the request."
                }
            });
        }
    },

    deleteOrder: function(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            db.run("DELETE FROM orders WHERE apiKey = ? AND ROWID = ?",
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
                    }

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
                            }

                            return res.status(204).send();
                        });
                });
        } else {
            return res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute order id (id) " +
                        " was not included in the request."
                }
            });
        }
    }
};

module.exports = orders;
