/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const HTMLParser = require('node-html-parser');

const server = require('../../app.js');

chai.should();

const db = require("../db/database.js");

const { exec } = require('child_process');

chai.use(chaiHttp);

let apiKey = "";

let config;

try {
    config = require('../../config/config.json');
} catch (error) {
    console.error(error);
}

var copyApiKey = process.env.COPY_API_KEY || config.copyApiKey;

describe('copier', () => {
    var token;

    before(() => {
        return new Promise((resolve) => {
            db.run("DELETE FROM apikeys", (err) => {
                if (err) {
                    console.error("Could not empty test DB table orders", err.message);
                }

                db.run("DELETE FROM products", (err) => {
                    if (err) {
                        console.error("Could not empty test DB table orders", err.message);
                    }

                    db.run("DELETE FROM orders", (err) => {
                        if (err) {
                            console.error("Could not empty test DB table orders", err.message);
                        }

                        db.run("DELETE FROM order_items", (err) => {
                            if (err) {
                                console.error("Could not empty test DB table orders", err.message);
                            }

                            exec(
                                'cat v2/db/seed.sql | sqlite3 v2/db/test.sqlite',
                                (error, stdout, stderr) => {
                                    if (error) {
                                        console.error(error.message);
                                        return;
                                    }

                                    if (stderr) {
                                        console.error(stderr);
                                        return;
                                    }

                                    resolve();
                                });
                        });
                    });
                });
            });
        });
    });

    describe('POST /v2/copier/products', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .post("/v2/copier/products")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@copier.com",
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

        it('should get 201 HAPPY PATH, 10 products should have been created', (done) => {
            chai.request(server)
                .post("/v2/copier/products")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(10);

                    done();
                });
        });

        it('should get 201 HAPPY PATH, only 10 in response', (done) => {
            chai.request(server)
                .post("/v2/copier/products")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(10);

                    done();
                });
        });

        it('should get 500 should not copy copyApiKey', (done) => {
            chai.request(server)
                .post("/v2/copier/products")
                .send({ api_key: copyApiKey })
                .end((err, res) => {
                    res.should.have.status(500);

                    done();
                });
        });
    });

    describe("POST /v2/copier/all", () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .post("/v2/copier/all")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@copierall.com",
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

        it('should get 201 HAPPY PATH', (done) => {
            chai.request(server)
                .post("/v2/copier/all")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");

                    res.body.data.should.have.property("products");
                    res.body.data.should.have.property("orders");

                    res.body.data.products.should.be.an("array");
                    res.body.data.products.length.should.equal(10);

                    res.body.data.orders.should.be.an("array");
                    res.body.data.orders.length.should.equal(4);

                    res.body.data.orders[0].order_items.should.be.an("array");
                    res.body.data.orders[0].order_items.length.should.equal(2);

                    res.body.data.orders[0].order_items[0].should.have.property("name");

                    done();
                });
        });

        it('should get 500 as we do not want to copy copyApiKey', (done) => {
            chai.request(server)
                .post("/v2/copier/all")
                .send({ api_key: copyApiKey })
                .end((err, res) => {
                    res.should.have.status(500);

                    done();
                });
        });

        it('should get 201 HAPPY PATH as we do not want to show all', (done) => {
            chai.request(server)
                .post("/v2/copier/all")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");

                    res.body.data.should.have.property("products");
                    res.body.data.should.have.property("orders");

                    res.body.data.products.should.be.an("array");
                    res.body.data.products.length.should.equal(10);

                    res.body.data.orders.should.be.an("array");
                    res.body.data.orders.length.should.equal(4);

                    res.body.data.orders[0].order_items.should.be.an("array");
                    res.body.data.orders[0].order_items.length.should.equal(2);

                    res.body.data.orders[0].order_items[0].should.have.property("name");

                    done();
                });
        });
    });

    describe("POST /v2/copier/reset", () => {
        var firstProductId;
        var firstOrderId;

        it('should get 500 as we cannot reset copyApiKey', (done) => {
            chai.request(server)
                .post("/v2/copier/reset")
                .send({ api_key: copyApiKey })
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(500);

                    done();
                });
        });

        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .post("/v2/copier/reset")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@copier.reset",
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

        it('should get 201 HAPPY PATH', (done) => {
            chai.request(server)
                .post("/v2/copier/all")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");

                    res.body.data.should.have.property("products");
                    res.body.data.should.have.property("orders");

                    res.body.data.products.should.be.an("array");
                    res.body.data.products.length.should.equal(10);

                    res.body.data.orders.should.be.an("array");
                    res.body.data.orders.length.should.equal(4);

                    res.body.data.orders[0].order_items.should.be.an("array");
                    res.body.data.orders[0].order_items.length.should.equal(2);

                    res.body.data.orders[0].order_items[0].should.have.property("name");

                    firstProductId = res.body.data.products[0].id;
                    firstOrderId = res.body.data.orders[0].id;

                    done();
                });
        });

        it('should get 201 HAPPY PATH registering', (done) => {
            let user = {
                api_key: apiKey,
                email: "test@reset.com",
                password: "testingreset"
            };

            chai.request(server)
                .post("/v2/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 200 HAPPY PATH logging in', (done) => {
            let user = {
                api_key: apiKey,
                email: "test@reset.com",
                password: "testingreset"
            };

            chai.request(server)
                .post("/v2/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("type");
                    res.body.data.type.should.equal("success");
                    res.body.data.should.have.property("token");

                    token = res.body.data.token;

                    done();
                });
        });

        it('should get 201 HAPPY PATH creating delivery', (done) => {
            let delivery = {
                product_id: firstProductId,
                amount: 10,
                delivery_date: "2018-02-01",
                comment: "Leverans av skruvar",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/deliveries")
                .send(delivery)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("id");
                    res.body.data.should.have.property("comment");
                    res.body.data.comment.should.equal("Leverans av skruvar");

                    done();
                });
        });

        it('should get 201 HAPPY PATH', (done) => {
            let invoice = {
                order_id: firstOrderId,
                total_price: 100,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/invoices")
                .set("x-access-token", token)
                .send(invoice)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 201 HAPPY PATH as we want to reset everything', (done) => {
            chai.request(server)
                .post("/v2/copier/reset")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");

                    res.body.data.should.have.property("products");
                    res.body.data.should.have.property("orders");

                    res.body.data.products.should.be.an("array");
                    res.body.data.products.length.should.equal(10);

                    res.body.data.orders.should.be.an("array");
                    res.body.data.orders.length.should.equal(4);

                    res.body.data.orders[0].order_items.should.be.an("array");
                    res.body.data.orders[0].order_items.length.should.equal(2);

                    res.body.data.orders[0].order_items[0].should.have.property("name");

                    res.body.data.products[0].id.should.equal(firstProductId);
                    res.body.data.orders[0].id.should.equal(firstOrderId);

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting no deliveries', (done) => {
            chai.request(server)
                .get("/v2/deliveries?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(0);

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting no invoices', (done) => {
            chai.request(server)
                .get("/v2/invoices?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(0);

                    done();
                });
        });
    });
});
