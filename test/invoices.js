/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

chai.should();

const db = require("../db/database.js");

chai.use(chaiHttp);

let apiKey = "";
let token = "";

describe('invoices', () => {
    before(() => {
        return new Promise((resolve) => {
            db.run("DELETE FROM invoices", (err) => {
                if (err) {
                    console.error("Could not empty test DB table invoices", err.message);
                }

                db.run("DELETE FROM orders", (err) => {
                    if (err) {
                        console.error("Could not empty test DB table orders", err.message);
                    }

                    resolve();
                });
            });
        });
    });

    describe('GET /invoices', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/invoices")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 HAPPY PATH FROM GETTING API KEY', (done) => {
            chai.request(server)
                .get("/api_key?email=test@invoice.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("key");

                    apiKey = res.body.data.key;

                    done();
                });
        });

        it('should get 401 as we have not logged in', (done) => {
            chai.request(server)
                .get("/invoices?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 201 HAPPY PATH registering', (done) => {
            let user = {
                api_key: apiKey,
                email: "test@invoice.com",
                password: "testinginvoice"
            };

            chai.request(server)
                .post("/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 401 UNIQUE CONSTRAINT', (done) => {
            let user = {
                api_key: apiKey,
                email: "test@invoice.com",
                password: "testinginvoice"
            };

            chai.request(server)
                .post("/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(500);

                    done();
                });
        });

        it('should get 200 HAPPY PATH logging in', (done) => {
            let user = {
                api_key: apiKey,
                email: "test@invoice.com",
                password: "testinginvoice"
            };

            chai.request(server)
                .post("/login")
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

        it('should get 200 HAPPY PATH getting no invoices', (done) => {
            chai.request(server)
                .get("/invoices?api_key=" + apiKey)
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

    describe('POST /invoice', () => {
        it('should get 201 HAPPY PATH creating order', (done) => {
            let order = {
                name: "Anders",
                api_key: apiKey
            };

            chai.request(server)
                .post("/order")
                .send(order)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 500 as we do not supply order_id', (done) => {
            let invoice = {
                // order_id: 1,
                total_price: 100,
                api_key: apiKey
            };

            chai.request(server)
                .post("/invoice")
                .set("x-access-token", token)
                .send(invoice)
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

        it('should get 500 as we do not supply total_price', (done) => {
            let invoice = {
                order_id: 1,
                // total_price: 100,
                api_key: apiKey
            };

            chai.request(server)
                .post("/invoice")
                .set("x-access-token", token)
                .send(invoice)
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

        it('should get 401 not providing token', (done) => {
            let invoice = {
                order_id: 1,
                total_price: 100,
                api_key: apiKey
            };

            chai.request(server)
                .post("/invoice")
                .send(invoice)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 201 HAPPY PATH', (done) => {
            let invoice = {
                order_id: 1,
                total_price: 100,
                api_key: apiKey
            };

            chai.request(server)
                .post("/invoice")
                .set("x-access-token", token)
                .send(invoice)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting the one invoice we just created', (done) => {
            chai.request(server)
                .get("/invoices?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });

        it('should get 201 Creating invoice with creation_date', (done) => {
            let invoice = {
                order_id: 1,
                total_price: 100,
                creation_date: "2019-02-13",
                api_key: apiKey
            };

            chai.request(server)
                .post("/invoice")
                .set("x-access-token", token)
                .send(invoice)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("creation_date");
                    res.body.data.creation_date.should.equal("2019-02-13");

                    done();
                });
        });

        it('should get 201 Creating invoice with due_date', (done) => {
            let invoice = {
                order_id: 1,
                total_price: 100,
                due_date: "2019-03-13",
                api_key: apiKey
            };

            chai.request(server)
                .post("/invoice")
                .set("x-access-token", token)
                .send(invoice)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("due_date");
                    res.body.data.due_date.should.equal("2019-03-13");

                    done();
                });
        });

        it('should get 201 Creating invoice with creation_date and due_date', (done) => {
            let invoice = {
                order_id: 1,
                total_price: 100,
                creation_date: "2019-02-13",
                due_date: "2019-03-13",
                api_key: apiKey
            };

            chai.request(server)
                .post("/invoice")
                .set("x-access-token", token)
                .send(invoice)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("creation_date");
                    res.body.data.creation_date.should.equal("2019-02-13");
                    res.body.data.should.have.property("due_date");
                    res.body.data.due_date.should.equal("2019-03-13");

                    done();
                });
        });
    });

    describe('GET /invoice', () => {
        it('should get 404 no id supplied', (done) => {
            chai.request(server)
                .get("/invoice?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(404);

                    done();
                });
        });

        it('should get 400 string id supplied', (done) => {
            chai.request(server)
                .get("/invoice/test?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });

        it('should get 401 not providing token', (done) => {
            chai.request(server)
                .get("/invoice/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/invoice/1?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("id");
                    res.body.data.id.should.be.equal(1);

                    done();
                });
        });

        it('should get 200, but empty data object', (done) => {
            chai.request(server)
                .get("/invoice/99?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql({});

                    done();
                });
        });
    });
});
