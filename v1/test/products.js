/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');

chai.should();

const db = require("../db/database.js");

chai.use(chaiHttp);

let apiKey = "";

describe('products', () => {
    before(() => {
        db.run("DELETE FROM products", (err) => {
            if (err) {
                console.log("Could not empty test DB table products", err.message);
            }
        });
    });

    describe('GET /products', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/v1/products")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 HAPPY PATH FROM GETTING API KEY', (done) => {
            chai.request(server)
                .get("/v1/api_key?email=test@product.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.should.have.property("key");

                    apiKey = res.body.data.key;

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting no products', (done) => {
            chai.request(server)
                .get("/v1/products?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(0);

                    done();
                });
        });
    });

    describe('POST /product', () => {
        it('should get 500 as we do not supply id', (done) => {
            let product = {
                name: "Screw",
                description: "Mighty fine screw.",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/product")
                .send(product)
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
            let product = {
                id: 1,
                description: "Mighty fine screw.",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/product")
                .send(product)
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
            let product = {
                id: 1,
                name: "Screw",
                description: "Mighty fine screw.",
                price: 12,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/product")
                .send(product)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting the one product we just created', (done) => {
            chai.request(server)
                .get("/v1/products?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });

        it('should get 500 SQL Error product_id UNIQUE CONSTRAINT', (done) => {
            let product = {
                id: 1,
                name: "Screw",
                description: "Mighty fine screw.",
                price: 12,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/product")
                .send(product)
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

        it('should get 200 HAPPY PATH testing for special characters', (done) => {
            let product = {
                id: 11,
                name: "öäåÅÄÖ!#€%&/()=?'\"éñ''",
                description: "öäåÅÄÖ!#€%&/()=?'\"éñ''",
                price: 14,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/product")
                .send(product)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting the two products we just created', (done) => {
            chai.request(server)
                .get("/v1/products?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(2);

                    done();
                });
        });

        it('should get 201 creating product with SQL injection', (done) => {
            let product = {
                id: 12,
                name: "'; DROP TABLE products;--",
                description: "öäåÅÄÖ!#€%&/()=?'\"éñ''",
                price: 14,
                api_key: apiKey
            };

            chai.request(server)
                .post("/v1/product")
                .send(product)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });
    });

    describe('GET /product', () => {
        it('should get 404 no id supplied', (done) => {
            chai.request(server)
                .get("/v1/product?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(404);

                    done();
                });
        });

        it('should get 400 string id supplied', (done) => {
            chai.request(server)
                .get("/v1/product/test?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/v1/product/1?api_key=" + apiKey)
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
                .get("/v1/product/2?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql({});

                    done();
                });
        });
    });

    describe('GET /product/search/:query', () => {
        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/v1/product/search/screw?api_key=" + apiKey)
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
                .get("/v1/product/search/bolt?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.eql([]);

                    done();
                });
        });
    });

    describe('PUT /product', () => {
        it('should get 400 no id supplied', (done) => {
            let product = {
                name: "Big Screw",
                description: "Mighty fine big screw.",
                api_key: apiKey
            };

            chai.request(server)
                .put("/v1/product?api_key=" + apiKey)
                .send(product)
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
            let product = {
                id: 1,
                name: "Big Screw",
                description: "Mighty fine big screw.",
                price: 14,
                api_key: apiKey
            };

            chai.request(server)
                .put("/v1/product?api_key=" + apiKey)
                .send(product)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200, with changed name and description', (done) => {
            chai.request(server)
                .get("/v1/product/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.have.property("name");
                    res.body.data.name.should.be.equal("Big Screw");
                    res.body.data.should.have.property("description");
                    res.body.data.description.should.be.equal("Mighty fine big screw.");
                    res.body.data.should.have.property("price");
                    res.body.data.price.should.be.equal(14);

                    done();
                });
        });
    });

    describe('DELETE /product', () => {
        it('should get 400 no id supplied', (done) => {
            let product = {
                api_key: apiKey
            };

            chai.request(server)
                .delete("/v1/product?api_key=" + apiKey)
                .send(product)
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
            let product = {
                id: 1,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/v1/product")
                .send(product)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting two products', (done) => {
            chai.request(server)
                .get("/v1/products?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(2);

                    done();
                });
        });
    });
});
