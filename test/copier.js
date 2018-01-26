process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const should = chai.should();

const db = require("../db/database.js");

const { exec } = require('child_process');

chai.use(chaiHttp);

let apiKey = "";

describe('copier', () => {
    before(() => {
        db.run("DELETE FROM apiKeys", (err) => {
            if (err) {
                console.log("Could not empty test DB table apiKeys", err.message);
            }
        });

        db.run("DELETE FROM products", (err) => {
            if (err) {
                console.log("Could not empty test DB table orders", err.message);
            }
        });

        db.run("DELETE FROM orders", (err) => {
            if (err) {
                console.log("Could not empty test DB table orders", err.message);
            }
        });

        db.run("DELETE FROM order_items", (err) => {
            if (err) {
                console.log("Could not empty test DB table orders", err.message);
            }
        });


        exec('cat db/migrate.sql | sqlite3 db/test.sqlite', (error, stdout, stderr) => {
            if (error) {
                console.log(error.message);
                return;
            }

            exec('cat db/seed.sql | sqlite3 db/test.sqlite', (error, stdout, stderr) => {
                if (error) {
                    console.log(error.message);
                    return;
                }
            });
        });

        console.log("Ready for take-off");
    });

    describe('POST /copy_products', () => {
        console.log("Took-off");

        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .post("/copy_products")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 200 HAPPY PATH FROM GETTING API KEY', (done) => {
            chai.request(server)
                .get("/api_key?email=test@order.com")
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
                .post("/copy_products")
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
                .post("/copy_orders")
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
                .post("/copy_all")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 200 HAPPY PATH FROM GETTING API KEY', (done) => {
            chai.request(server)
                .get("/api_key?email=test@order.com")
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
                .post("/copy_all")
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
