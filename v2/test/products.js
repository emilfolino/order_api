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
                .get("/v2/products")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@product.com",
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

        it('should get 200 HAPPY PATH getting no products', (done) => {
            chai.request(server)
                .get("/v2/products?api_key=" + apiKey)
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
        it('should get 500 as we do not supply name', (done) => {
            let product = {
                id: 1,
                description: "Mighty fine screw.",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/products")
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

        it('should get 201 HAPPY PATH', (done) => {
            let product = {
                name: "Screw",
                description: "Mighty fine screw.",
                price: 12,
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

        it('should get 200 HAPPY PATH getting the one product we just created', (done) => {
            chai.request(server)
                .get("/v2/products?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });

        it('should get 201 HAPPY PATH testing for special characters', (done) => {
            let product = {
                name: "öäåÅÄÖ!#€%&/()=?'\"éñ''",
                description: "öäåÅÄÖ!#€%&/()=?'\"éñ''",
                price: 14,
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

        it('should get 200 HAPPY PATH getting the two products we just created', (done) => {
            chai.request(server)
                .get("/v2/products?api_key=" + apiKey)
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
                name: "'; DROP TABLE products;--",
                description: "öäåÅÄÖ!#€%&/()=?'\"éñ''",
                price: 14,
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
    });

    describe('GET /product', () => {
        it('should get 400 string id supplied', (done) => {
            chai.request(server)
                .get("/v2/products/test?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(400);

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/v2/products/1?api_key=" + apiKey)
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
                .get("/v2/products/4?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.eql({});

                    done();
                });
        });
    });

    describe('GET /products/search/:query', () => {
        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/v2/products/search/screw?api_key=" + apiKey)
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
                .get("/v2/products/search/bolt?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.eql([]);

                    done();
                });
        });
    });

    describe('PUT /products', () => {
        it('should get 400 no id supplied', (done) => {
            let product = {
                name: "Big Screw",
                description: "Mighty fine big screw.",
                api_key: apiKey
            };

            chai.request(server)
                .put("/v2/products")
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
                .put("/v2/products")
                .send(product)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200, with changed name and description', (done) => {
            chai.request(server)
                .get("/v2/products/1?api_key=" + apiKey)
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

        it('should get 204 HAPPY PATH', (done) => {
            let product = {
                id: 1,
                name: "Big Screw 14",
                // description: "Mighty fine big big screw.",
                price: 14,
                api_key: apiKey
            };

            chai.request(server)
                .put("/v2/products")
                .send(product)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200, with changed name and no loss of description', (done) => {
            chai.request(server)
                .get("/v2/products/1?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.have.property("name");
                    res.body.data.name.should.be.equal("Big Screw 14");
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
                .delete("/v2/products")
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
                .delete("/v2/products")
                .send(product)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting two products', (done) => {
            chai.request(server)
                .get("/v2/products?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(2);

                    done();
                });
        });
    });

    describe('GET /products/everything', () => {
        it('should get all products without api_key', (done) => {
            chai.request(server)
                .get("/v2/products/everything")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(2);

                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@producteverything.com",
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

        it('should get 204 HAPPY PATH', (done) => {
            let product = {
                name: "Marshmallow",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/products")
                .send(product)
                .end((err, res) => {
                    res.should.have.status(201);

                    done();
                });
        });

        it('should get 200 HAPPY PATH getting one product', (done) => {
            chai.request(server)
                .get("/v2/products?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });

        it('should get all products without api_key', (done) => {
            chai.request(server)
                .get("/v2/products/everything")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(3);

                    done();
                });
        });
    });
});
