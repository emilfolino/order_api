/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const HTMLParser = require('node-html-parser');

const server = require('../../app.js');

const { exec } = require('child_process');

chai.should();

const db = require("../db/database.js");

chai.use(chaiHttp);

let apiKey = "";

describe('orders', () => {
    before(() => {
        return new Promise((resolve) => {
            db.run("DELETE FROM apikeys", (err) => {
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
                                    'cat v2/db/status_seed.sql | sqlite3 v2/db/test.sqlite',
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
                .get("/v2/orders")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@orders.com",
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

        it('should get 200 HAPPY PATH getting no orders', (done) => {
            chai.request(server)
                .get("/v2/orders?api_key=" + apiKey)
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
        it('should get 500 as we do not supply name', (done) => {
            let order = {
                id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/orders")
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
                .post("/v2/orders")
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
                .get("/v2/orders?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });
    });

    describe('GET /order', () => {
        it('should get 400 string id supplied', (done) => {
            chai.request(server)
                .get("/v2/orders/test?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(400);

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
                    res.body.data.order_items.length.should.be.equal(0);

                    done();
                });
        });

        it('should get 200, but empty data object', (done) => {
            chai.request(server)
                .get("/v2/orders/2?api_key=" + apiKey)
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
                .get("/v2/orders/search/anders?api_key=" + apiKey)
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
                .get("/v2/orders/search/bengt?api_key=" + apiKey)
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
                .put("/v2/orders")
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
                .put("/v2/orders")
                .send(order)
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
                    res.body.data.name.should.be.equal("Bengt");

                    done();
                });
        });

        it('should get 204 HAPPY PATH', (done) => {
            let order = {
                id: 1,
                // name: "Bengt",
                city: "Bengtfors",
                api_key: apiKey,
            };

            chai.request(server)
                .put("/v2/orders")
                .send(order)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200, with name still there and added address', (done) => {
            chai.request(server)
                .get("/v2/orders/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.have.property("name");
                    res.body.data.name.should.be.equal("Bengt");

                    res.body.data.should.have.property("address");
                    res.body.data.city.should.be.equal("Bengtfors");

                    done();
                });
        });

        it('should get 204 HAPPY PATH', (done) => {
            let order = {
                id: 1,
                // name: "Bengt",
                city: "Bengtfors",
                status: "Packad",
                status_id: 200,
                api_key: apiKey,
            };

            chai.request(server)
                .put("/v2/orders")
                .send(order)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200, still with 1 order', (done) => {
            chai.request(server)
                .get("/v2/orders?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });

        it('should get 204 HAPPY PATH', (done) => {
            let order = {
                id: 1,
                name: "Bengt",
                city: "Bengtfors",
                status: "Packad",
                status_id: 200,
                image_url: "https://i.redd.it/v6p8ahelw5811.jpg",
                api_key: apiKey,
            };

            chai.request(server)
                .put("/v2/orders")
                .send(order)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200, still with 1 order', (done) => {
            chai.request(server)
                .get("/v2/orders?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);
                    res.body.data[0].should.have.property("image_url");
                    res.body.data[0].image_url.should.be.equal(
                        "https://i.redd.it/v6p8ahelw5811.jpg"
                    );

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
                .delete("/v2/orders")
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
                .delete("/v2/orders")
                .send(order)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting no orders', (done) => {
            chai.request(server)
                .get("/v2/orders?api_key=" + apiKey)
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
