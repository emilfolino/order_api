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

describe('deliveries', () => {
    before(() => {
        db.run("DELETE FROM deliveries", (err) => {
            if (err) {
                console.log("Could not empty test DB table deliveries", err.message);
            }
        });
    });

    describe('GET /deliveries', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/deliveries")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 HAPPY PATH FROM GETTING API KEY', (done) => {
            chai.request(server)
                .get("/api_key?email=test@deliveries.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("key");

                    apiKey = res.body.data.key;

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting no deliveries', (done) => {
            chai.request(server)
                .get("/deliveries?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(0);

                    done();
                });
        });
    });

    describe('POST /delivery', () => {
        it('should get 500 as we do not supply productId', (done) => {
            let delivery = {
                id: 1,
                // product_id: 1,
                amount: 10,
                delivery_date: "2018-02-01",
                comment: "Leverans av skruvar",
                api_key: apiKey
            };

            chai.request(server)
                .post("/delivery")
                .send(delivery)
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

        it('should get 500 as we do not supply amount', (done) => {
            let delivery = {
                id: 1,
                product_id: 1,
                // amount: 10,
                delivery_date: "2018-02-01",
                comment: "Leverans av skruvar",
                api_key: apiKey
            };

            chai.request(server)
                .post("/delivery")
                .send(delivery)
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

        it('should get 500 as we do not supply delivery_date', (done) => {
            let delivery = {
                id: 1,
                product_id: 1,
                amount: 10,
                // delivery_date: "2018-02-01",
                comment: "Leverans av skruvar",
                api_key: apiKey
            };

            chai.request(server)
                .post("/delivery")
                .send(delivery)
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
            let delivery = {
                product_id: 1,
                amount: 10,
                delivery_date: "2018-02-01",
                comment: "Leverans av skruvar",
                api_key: apiKey
            };

            chai.request(server)
                .post("/delivery")
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

        it('should get 200 HAPPY PATH getting the one product we just created', (done) => {
            chai.request(server)
                .get("/deliveries?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });
    });

    describe('DELETE /delivery', () => {
        it('should get 400 as we do not supply id', (done) => {
            let delivery = {
                // id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/delivery")
                .send(delivery)
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
            let delivery = {
                id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/delivery")
                .send(delivery)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting zero deliveries', (done) => {
            chai.request(server)
                .get("/deliveries?api_key=" + apiKey)
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
