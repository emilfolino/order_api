const express = require('express');
const path = require("path");
const router = express.Router();
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema
} = require("graphql");

const authModel = require("./models/auth.js");

const auth = require("./route/auth.js");
const copier = require("./route/copier.js");
const deliveries = require("./route/deliveries.js");
const invoices = require("./route/invoices.js");
const orderItems = require("./route/order_items.js");
const orders = require("./route/orders.js");
const products = require("./route/products.js");

const RootQueryType = require("./graphql/root.js");

router.all('*', authModel.checkAPIKey);

router.use("/products", products);
router.use("/auth", auth);
router.use("/copier", copier);
router.use("/deliveries", deliveries);
router.use("/invoices", invoices);
router.use("/order_items", orderItems);
router.use("/orders", orders);

router.get('/', (req, res) => res.sendFile(path.join(__dirname + '/documentation.html')));

const schema = new GraphQLSchema({
    query: RootQueryType
});

router.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

router.use(function (req, res) {
    return res.status(404).json({
        errors: {
            status: 404,
            source: req.path,
            title: "Not found",
            detail: "Could not find path: " + req.path,
        }
    });
});

module.exports = router;
