const express = require('express');
const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function errorResponse(res, path, err, status=500) {
    return res.status(status).json({
        errors: {
            status: status,
            source: path,
            title: "Stripe error",
            detail: err.message
        }
    });
}

router.post('/create-checkout-session', async (req, res) => {
    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
        return errorResponse(res, "/stripe/create-checkout-session",
            new Error("Required attribute items must be a non-empty array."), 400);
    }

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: req.body.items,
            mode: 'payment',
            ui_mode: 'embedded',
            return_url: `${req.body.return_url}?session_id={CHECKOUT_SESSION_ID}`
        });

        return res.send({ clientSecret: session.client_secret });
    } catch (err) {
        return errorResponse(res, "/stripe/create-checkout-session", err,
            err.statusCode || 500);
    }
});

router.get('/session-status', async (req, res) => {
    if (!req.query.session_id) {
        return errorResponse(res, "/stripe/session-status",
            new Error("Required query parameter session_id is missing."), 400);
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

        res.send({
            status: session.status,
            customer_email: session.customer_details ?
                session.customer_details.email : null,
            payment_id: session.payment_intent,
        });
    } catch (err) {
        return errorResponse(res, "/stripe/session-status", err,
            err.statusCode || 500);
    }
});

module.exports = router;
