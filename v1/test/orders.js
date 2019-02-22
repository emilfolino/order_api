/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');

const { exec } = require('child_process');

chai.should();

const db = require("../db/database.js");

chai.use(chaiHttp);

let apiKey = "";

describe('orders', () => {
    before(() => {
        return new Promise((resolve) => {
            db.run("DELETE FROM apiKeys", (err) => {
                if (err) {
                    console.log("Could not empty test DB", err.message);
                }

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

                            db.run("DELETE FROM status", (err) => {
                                if (err) {
                                    console.log(
                                        "Could not empty test DB table orders",
                                        err.message
                                    );
                                }

                                exec(
                                    "cat v1/db/status_seed.sql |" +
                                    " sqlite3 v1/db/test.sqlite",
                                    (error, stdout, stderr) => {
                                        if (error) {
                                            console.log(error.message);
                                            return;
                                        }

                                        if (stderr) {
                                            console.log(stderr);
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
    });

    describe('GET /orders', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/v1/orders")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 HAPPY PATH FROM GETTING API KEY', (done) => {
            chai.request(server)
                .get("/v1/api_key?email=test@order.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("key");

                    apiKey = res.body.data.key;

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting no orders', (done) => {
            chai.request(server)
                .get("/v1/orders?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(0);

                    done();
                });
        });
    });

    describe('POST /order', () => {
        it('should get 500 as we do not supply id', (done) => {
            let order = {
                name: "Anders",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/order")
                .send(order)
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

        it('should get 500 as we do not supply name', (done) => {
            let order = {
                id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/order")
                .send(order)
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

        it('should get 201 HAPPY PATH', (done) => {
            let order = {
                id: 1,
                name: "Anders",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/order")
                .send(order)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting the one order we just created', (done) => {
            chai.request(server)
                .get("/v1/orders?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });

        it('should get 500 UNIQUE CONSTRAINT error', (done) => {
            let order = {
                id: 1,
                name: "Anders",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/order")
                .send(order)
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

    describe('GET /order', () => {
        it('should get 404 no id supplied', (done) => {
            chai.request(server)
                .get("/v1/order?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(404);

                    done();
                });
        });

        it('should get 400 string id supplied', (done) => {
            chai.request(server)
                .get("/v1/order/test?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/v1/order/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("id");
                    res.body.data.id.should.be.equal(1);
                    res.body.data.order_items.should.be.an("array");
                    res.body.data.order_items.length.should.be.equal(0);

                    done();
                });
        });

        it('should get 200, but empty data object', (done) => {
            chai.request(server)
                .get("/v1/order/2?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.eql({});

                    done();
                });
        });
    });

    describe('GET /order/search/:query', () => {
        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/v1/order/search/anders?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });

        it('should get 200, but empty data object', (done) => {
            chai.request(server)
                .get("/v1/order/search/bengt?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.eql([]);

                    done();
                });
        });
    });

    describe('PUT /order', () => {
        it('should get 400 no id supplied', (done) => {
            let order = {
                name: "Bengt",
                api_key: apiKey
            };

            chai.request(server)
                .put("/v1/order?api_key=" + apiKey)
                .send(order)
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
            let order = {
                id: 1,
                name: "Bengt",
                api_key: apiKey
            };

            chai.request(server)
                .put("/v1/order?api_key=" + apiKey)
                .send(order)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200, with changed name and description', (done) => {
            chai.request(server)
                .get("/v1/order/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.have.property("name");
                    res.body.data.name.should.be.equal("Bengt");

                    done();
                });
        });
    });

    describe('DELETE /order', () => {
        it('should get 400 no id supplied', (done) => {
            let order = {
                api_key: apiKey
            };

            chai.request(server)
                .delete("/v1/order?api_key=" + apiKey)
                .send(order)
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
            let order = {
                id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/v1/order")
                .send(order)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting no orders', (done) => {
            chai.request(server)
                .get("/v1/orders?api_key=" + apiKey)
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
