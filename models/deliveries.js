const db = require("../db/database.js");

const deliveries = {
    sql: "SELECT ROWID as id, productId as product_id, amount," +
                    " deliveryDate as delivery_date, comment" +
                    " FROM deliveries WHERE apiKey = ?",

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
            deliveries.sql + " AND ROWID = ?",
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

                res.status(201).json({ data: row });
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
    }

};

module.exports = deliveries;
