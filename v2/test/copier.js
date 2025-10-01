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

var copyApiKey = process.env.COPY_API_KEY;

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
                                'cat v2/db/seed-music.sql | sqlite3 v2/db/test.sqlite',
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

        it('should get 201 HAPPY PATH, 12 products should have been created', (done) => {
            chai.request(server)
                .post("/v2/copier/products")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(12);

                    done();
                });
        });

        it('should get 201 HAPPY PATH, only 12 in response', (done) => {
            chai.request(server)
                .post("/v2/copier/products")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(12);

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
});
