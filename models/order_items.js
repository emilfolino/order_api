const db = require("../db/database.js");

module.exports = (function () {
    function addOrderItem(res, body) {
        db.run("INSERT INTO order_items (orderId, productId, amount, apiKey) VALUES (?, ?, ?, ?)",
            body.order_id,
            body.product_id,
            body.amount,
            body.api_key, (err) => {
                if (err) {
                    res.status(400).json({ errors: { status: 400, detail: err.message } });
                } else {
                    res.status(201).json({ data: body });
                }
            });
    }

    function updateOrderItem(res, body) {
        if (Number.isInteger(parseInt(body.order_id)) &&
            Number.isInteger(parseInt(body.product_id))) {
            db.run("UPDATE order_items SET orderId = ?, productId = ?, amount = ?" +
                " WHERE apiKey = ? AND orderId = ? AND productId = ?",
            body.order_id,
            body.product_id,
            body.amount,
            body.api_key,
            body.order_id,
            body.product_id, (err) => {
                if (err) {
                    res.status(400).json({ errors: { status: 400, detail: err.message } });
                } else {
                    res.status(204).send();
                }
            });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attributes order id and product id" +
                        " was not included in the request."
                }
            });
        }
    }

    function deleteOrderItem(res, body) {
        if (Number.isInteger(parseInt(body.order_id)) &&
            Number.isInteger(parseInt(body.product_id))) {
            db.run("DELETE FROM order_items WHERE apiKey = ? AND orderId = ? AND productId = ?",
                body.api_key,
                body.order_id,
                body.product_id, (err) => {
                    if (err) {
                        res.status(400).json({ errors: { status: 400, detail: err.message } });
                    } else {
                        res.status(204).send();
                    }
                });
        } else {
            res.status(400).json({
                errors: {
                    status: 400,
                    detail: "Required attributes order id and product id" +
                        " was not included in the request."
                }
            });
        }
    }

    return {

        addOrderItem: addOrderItem,
        updateOrderItem: updateOrderItem,
        deleteOrderItem: deleteOrderItem,
    };
}());
