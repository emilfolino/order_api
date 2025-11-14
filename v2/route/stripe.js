const express = require('express');
const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        line_items: req.body.items,
        mode: 'payment',
        ui_mode: 'embedded',
        return_url: `${req.body.return_url}?session_id={CHECKOUT_SESSION_ID}`
    });

    return res.send({ clientSecret: session.client_secret });
});

router.get('/session-status', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

    res.send({
        status: session.status,
        customer_email: session.customer_details.email,
        payment_id: session.payment_intent,
    });
});

module.exports = router;

