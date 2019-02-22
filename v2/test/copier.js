/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');

chai.should();

const db = require("../db/database.js");

const { exec } = require('child_process');

chai.use(chaiHttp);

let apiKey = "";

describe('copier', () => {
    before(() => {
        return new Promise((resolve) => {
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
                            'cat v2/db/seed_v2.sql | sqlite3 v2/db/test.sqlite',
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

    describe('POST /copier/products', () => {
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

        it('should get 200 HAPPY PATH FROM GETTING API KEY', (done) => {
            chai.request(server)
                .get("/v2/auth/api_key?email=test@copy.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("key");

                    apiKey = res.body.data.key;

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
    });

    describe('POST /copy_orders', () => {
        it('should get 201 HAPPY PATH, 4 orders should have been created', (done) => {
            chai.request(server)
                .post("/v2/copier/orders")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(4);

                    done();
                });
        });
    });

    describe("POST /copy_all", () => {
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

        it('should get 200 HAPPY PATH FROM GETTING API KEY', (done) => {
            chai.request(server)
                .get("/v2/auth/api_key?email=test@copyall.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("key");

                    apiKey = res.body.data.key;

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
                    res.body.data.should.have.property("message");

                    done();
                });
        });
    });
});
