const db = require("../db/database.js");

const deliveries = {
    sql: "SELECT d.ROWID as id, d.productId as product_id, amount," +
            " d.deliveryDate as delivery_date, comment," +
            " p.productName as product_name" +
            " FROM deliveries d" +
            " INNER JOIN products p" +
            " ON p.ROWID = d.productId AND d.apiKey = p.apiKey" +
            " WHERE d.apiKey = ?",

    getDeliveries: function(res, apiKey) {
        db.all(deliveries.sql, apiKey, (err, rows) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/deliveries",
                        title: "Database error",
                        detail: err.message
                    }
                });
            }

            res.json({ data: rows });
        });
    },

    getDelivery: function(res, deliveryId, apiKey, status=200) {
        db.get(
            deliveries.sql + " AND d.ROWID = ?",
            apiKey,
            deliveryId,
            function(err, row) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/deliveries",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                res.status(status).json({ data: row });
            });
    },

    addDelivery: function(res, body) {
        const sql = "INSERT INTO deliveries (productId, amount, deliveryDate," +
                        " comment, apiKey) VALUES (?, ?, ?, ?, ?)";

        db.run(sql,
            body.product_id,
            body.amount,
            body.delivery_date,
            body.comment,
            body.api_key,
            function(err) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/delivery",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                deliveries.getDelivery(res, this.lastID, body.api_key, 201);
            });
    },

    deleteDelivery: function(res, body) {
        if (Number.isInteger(parseInt(body.id))) {
            const sql = "DELETE FROM deliveries WHERE apiKey = ? AND ROWID = ?";

            db.run(sql,
                body.api_key,
                body.id, (err) => {
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

                    res.status(204).send();
                });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attribute delivery id (id)" +
                        " was not included in the request."
                }
            });
        }
    }
};

module.exports = deliveries;
