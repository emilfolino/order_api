const db = require("../db/database.js");

module.exports = (function () {
    function getDeliveries(res, apiKey) {
        db.all("SELECT deliveryId, productId, amount, deliveryDate, comment FROM deliveries WHERE apiKey = ?", apiKey, (err, rows) => {
            if (err) {
                res.status(400).json({ errors: { status: 400, detail: err.message } });
            } else {
                res.json({ data: rows });
            }
        });
    }

    function addDelivery(res, body) {
        db.run("INSERT INTO deliveries (deliveryId, productId, amount, deliveryDate, comment, apiKey) VALUES (?, ?, ?, ?, ?, ?)",
            body.id,
            body.product_id,
            body.amount,
            body.deliveryDate,
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
