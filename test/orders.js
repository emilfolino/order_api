process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const should = chai.should();

const db = require("../db/database.js");

chai.use(chaiHttp);

let apiKey = "";


describe('orders', () => {
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
    });

    describe('GET /orders', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/orders")
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

        it('should get 200 HAPPY PATH getting no orders', (done) => {
            chai.request(server)
                .get("/orders?api_key=" + apiKey)
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
        it('should get 400 as we do not supply id', (done) => {
            let order = {
                name: "Anders",
                api_key: apiKey
            };

            chai.request(server)
                .post("/order")
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

        it('should get 400 as we do not supply name', (done) => {
            let order = {
                id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .post("/order")
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

        it('should get 200 HAPPY PATH', (done) => {
            let order = {
                id: 1,
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

        it('should get 200 HAPPY PATH getting the one order we just created', (done) => {
            chai.request(server)
                .get("/orders?api_key=" + apiKey)
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
        it('should get 404 no id supplied', (done) => {
            chai.request(server)
                .get("/order?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(404);

                    done();
                });
        });

        it('should get 400 string id supplied', (done) => {
            chai.request(server)
                .get("/order/test?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/order/1?api_key=" + apiKey)
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
                .get("/order/2?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.eql({});

                    done();
                });
        });
    });
    //
    // describe('GET /product/search/:query', () => {
    //     it('should get 200 HAPPY PATH', (done) => {
    //         chai.request(server)
    //             .get("/product/search/screw?api_key=" + apiKey)
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.an("object");
    //                 res.body.data.should.be.an("array");
    //                 res.body.data.length.should.be.equal(1);
    //
    //                 done();
    //             });
    //     });
    //
    //     it('should get 200, but empty data object', (done) => {
    //         chai.request(server)
    //             .get("/product/search/bolt?api_key=" + apiKey)
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.data.should.be.eql([]);
    //
    //                 done();
    //             });
    //     });
    // });
    //
    // describe('PUT /product', () => {
    //     it('should get 400 no id supplied', (done) => {
    //         let product = {
    //             name: "Big Screw",
    //             description: "Mighty fine big screw.",
    //             api_key: apiKey
    //         };
    //
    //         chai.request(server)
    //             .put("/product?api_key=" + apiKey)
    //             .send(product)
    //             .end((err, res) => {
    //                 res.should.have.status(400);
    //                 res.body.should.be.an("object");
    //                 res.body.should.have.property("errors");
    //                 res.body.errors.should.have.property("status");
    //                 res.body.errors.status.should.be.equal(400);
    //                 res.body.errors.should.have.property("detail");
    //
    //                 done();
    //             });
    //     });
    //
    //     it('should get 204 HAPPY PATH', (done) => {
    //         let product = {
    //             id: 1,
    //             name: "Big Screw",
    //             description: "Mighty fine big screw.",
    //             api_key: apiKey
    //         };
    //
    //         chai.request(server)
    //             .put("/product?api_key=" + apiKey)
    //             .send(product)
    //             .end((err, res) => {
    //                 res.should.have.status(204);
    //
    //                 done();
    //             });
    //     });
    //
    //     it('should get 200, with changed name and description', (done) => {
    //         chai.request(server)
    //             .get("/product/1?api_key=" + apiKey)
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.data.should.have.property("name");
    //                 res.body.data.name.should.be.equal("Big Screw");
    //                 res.body.data.should.have.property("description");
    //                 res.body.data.description.should.be.equal("Mighty fine big screw.");
    //
    //                 done();
    //             });
    //     });
    // });
    //
    // describe('DELETE /product', () => {
    //     it('should get 400 no id supplied', (done) => {
    //         let product = {
    //             api_key: apiKey
    //         };
    //
    //         chai.request(server)
    //             .delete("/product?api_key=" + apiKey)
    //             .send(product)
    //             .end((err, res) => {
    //                 res.should.have.status(400);
    //                 res.body.should.be.an("object");
    //                 res.body.should.have.property("errors");
    //                 res.body.errors.should.have.property("status");
    //                 res.body.errors.status.should.be.equal(400);
    //                 res.body.errors.should.have.property("detail");
    //
    //                 done();
    //             });
    //     });
    //
    //     it('should get 204 HAPPY PATH', (done) => {
    //         let product = {
    //             id: 1,
    //             api_key: apiKey
    //         };
    //
    //         chai.request(server)
    //             .delete("/product")
    //             .send(product)
    //             .end((err, res) => {
    //                 res.should.have.status(204);
    //
    //                 done();
    //             });
    //     });
    //
    //     it('should get 200 HAPPY PATH getting no products', (done) => {
    //         chai.request(server)
    //             .get("/products?api_key=" + apiKey)
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.an("object");
    //                 res.body.data.should.be.an("array");
    //                 res.body.data.length.should.be.equal(0);
    //
    //                 done();
    //             });
    //     });
    // });
});
