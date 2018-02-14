const db = require("../db/database.js");

module.exports = (function () {
    function getDeliveries(res, apiKey) {
        const sql = "SELECT deliveryId as id, productId as product_id, amount," +
                        " deliveryDate as delivery_date, comment" +
                        " FROM deliveries WHERE apiKey = ?";

        db.all(sql, apiKey, (err, rows) => {
            if (err) {
                res.status(400).json({ errors: { status: 400, detail: err.message } });
            } else {
                res.json({ data: rows });
            }
        });
    }

    function addDelivery(res, body) {
        const sql = "INSERT INTO deliveries (deliveryId, productId, amount, deliveryDate," +
                        " comment, apiKey) VALUES (?, ?, ?, ?, ?, ?)";

        db.run(sql,
            body.id,
            body.product_id,
            body.amount,
            body.delivery_date,
            body.comment,
            body.api_key, (err) => {
                if (err) {
                    res.status(400).json({ errors: { status: 400, detail: err.message } });
                } else {
                    res.status(201).json({ data: body });
                }
            });
    }

    return {
        getDeliveries: getDeliveries,
        addDelivery: addDelivery,
    };
}());
