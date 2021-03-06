/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const HTMLParser = require('node-html-parser');

const server = require('../../app.js');

chai.should();

const db = require("../db/database.js");

chai.use(chaiHttp);

let apiKey = "";

describe('order items', () => {
    before(() => {
        return new Promise((resolve) => {
            db.run("DELETE FROM products", (err) => {
                if (err) {
                    console.log("Could not empty test DB table orders", err.message);
                }

                db.run("DELETE FROM orders", (err) => {
                    if (err) {
                        console.log("Could not empty test DB table orders", err.message);
                    }

                    db.run("DELETE FROM order_items", (err) => {
                        if (err) {
                            console.log("Could not empty test DB table orders", err.message);
                        }

                        resolve();
                    });
                });
            });
        });
    });

    describe('POST /v2/order_items', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            let orderItem = {
                order_id: 1,
                product_id: 1,
                amount: 1,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@orderitem.com",
                gdpr: "gdpr"
            };

            chai.request(server)
                .post("/v2/auth/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    apiKey = apiKeyElement.childNodes[0].rawText;

                    done();
                });
        });


        it('should get 500 as we do not supply order id', (done) => {
            let orderItem = {
                // order_id: 1,
                product_id: 1,
                amount: 1,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");
                    res.body.errors.should.have.property("status");
                    res.body.errors.status.should.be.equal(500);
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });

        it('should get 500 as we do not supply product id', (done) => {
            let orderItem = {
                order_id: 1,
                // product_id: 1,
                amount: 1,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");
                    res.body.errors.should.have.property("status");
                    res.body.errors.status.should.be.equal(500);
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            let order = {
                id: 1,
                name: "Anders",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/orders")
                .send(order)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            let product = {
                id: 1,
                name: "Screw",
                description: "Mighty fine screw.",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/products")
                .send(product)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            let orderItem = {
                order_id: 1,
                product_id: 1,
                amount: 1,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/v2/orders/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("id");
                    res.body.data.id.should.be.equal(1);
                    res.body.data.order_items.should.be.an("array");
                    res.body.data.order_items.length.should.be.equal(1);

                    done();
                });
        });

        it('should get 500 UNIQUE CONSTRAINT', (done) => {
            let orderItem = {
                order_id: 1,
                product_id: 1,
                amount: 1,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");
                    res.body.errors.should.have.property("status");
                    res.body.errors.status.should.be.equal(500);
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });
    });

    describe('PUT /v2/order_items', () => {
        it('should get 400 no order id supplied', (done) => {
            let orderItem = {
                // order_id: 1,
                product_id: 1,
                amount: 2,
                api_key: apiKey
            };

            chai.request(server)
                .put("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");
                    res.body.errors.should.have.property("status");
                    res.body.errors.status.should.be.equal(400);
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });

        it('should get 400 no product id supplied', (done) => {
            let orderItem = {
                order_id: 1,
                // product_id: 1,
                amount: 2,
                api_key: apiKey
            };

            chai.request(server)
                .put("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");
                    res.body.errors.should.have.property("status");
                    res.body.errors.status.should.be.equal(400);
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });

        it('should get 204 HAPPY PATH', (done) => {
            let orderItem = {
                order_id: 1,
                product_id: 1,
                amount: 2,
                api_key: apiKey
            };

            chai.request(server)
                .put("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200, with changed name and description', (done) => {
            chai.request(server)
                .get("/v2/orders/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.have.property("name");
                    res.body.data.order_items.should.be.an("array");
                    res.body.data.order_items.length.should.be.equal(1);
                    res.body.data.order_items[0].should.have.property("amount");
                    res.body.data.order_items[0].amount.should.be.equal(2);

                    done();
                });
        });
    });

    describe('DELETE /v2/order_items', () => {
        it('should get 400 no order id supplied', (done) => {
            let orderItem = {
                // order_id: 1,
                product_id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");
                    res.body.errors.should.have.property("status");
                    res.body.errors.status.should.be.equal(400);
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });

        it('should get 400 no product id supplied', (done) => {
            let orderItem = {
                order_id: 1,
                // product_id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");
                    res.body.errors.should.have.property("status");
                    res.body.errors.status.should.be.equal(400);
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });

        it('should get 204 HAPPY PATH', (done) => {
            let orderItem = {
                order_id: 1,
                product_id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/v2/order_items")
                .send(orderItem)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting no order items', (done) => {
            chai.request(server)
                .get("/v2/orders/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("order_items");
                    res.body.data.order_items.should.be.an("array");
                    res.body.data.order_items.length.should.equal(0);

                    done();
                });
        });
    });
});
