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

describe('auth', () => {
    before(() => {
        db.run("DELETE FROM apiKeys", (err) => {
            if (err) {
                console.error("Could not empty test DB apiKeys", err.message);
            }
        });

        db.run("DELETE FROM users", (err) => {
            if (err) {
                console.error("Could not empty test DB users", err.message);
            }
        });
    });

    describe('GET /api_key', () => {
        it('200 HAPPY PATH getting form', (done) => {
            chai.request(server)
                .get("/v2/auth/api_key")
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@auth.com",
                gdpr: "gdpr"
            };

            chai.request(server)
                .post("/v2/auth/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    apiKeyElement.should.be.an("object");

                    apiKey = apiKeyElement.childNodes[0].rawText;

                    apiKey.length.should.equal(32);

                    done();
                });
        });

        it('should get 200 but no apikey element not a valid email', (done) => {
            let user = {
                email: "test",
                gdpr: "gdpr"
            };

            chai.request(server)
                .post("/v2/auth/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    (apiKeyElement === null).should.be.true;

                    let messageElement = HTMLResponse.querySelector('#error');

                    messageElement.should.be.an("object");

                    let message = messageElement.childNodes[0].rawText;

                    message.should.equal("A valid email address is required to obtain an API key.");

                    done();
                });
        });

        it('should get 200 but no apikey element no gdpr', (done) => {
            let user = {
                email: "test@auth.com"
            };

            chai.request(server)
                .post("/v2/auth/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    (apiKeyElement === null).should.be.true;

                    let messageElement = HTMLResponse.querySelector('#error');

                    messageElement.should.be.an("object");

                    let message = messageElement.childNodes[0].rawText;

                    message.should.equal("Approve the terms and conditions.");

                    done();
                });
        });

        it('should get 200 but no apikey element not correct gdpr', (done) => {
            let user = {
                email: "test@auth.com",
                gdpr: "gdprgdpr"
            };

            chai.request(server)
                .post("/v2/auth/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    (apiKeyElement === null).should.be.true;

                    let messageElement = HTMLResponse.querySelector('#error');

                    messageElement.should.be.an("object");

                    let message = messageElement.childNodes[0].rawText;

                    message.should.equal("Approve the terms and conditions.");

                    done();
                });
        });
    });

    describe('POST /register', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
                // api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we do not provide email', (done) => {
            let user = {
                //email: "test@example.com",
                password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we do not provide password', (done) => {
            let user = {
                email: "test@example.com",
                // password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 201 HAPPY PATH', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.equal("User successfully registered.");

                    done();
                });
        });
    });

    describe('POST /login', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
                // api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we do not provide email', (done) => {
            let user = {
                //email: "test@example.com",
                password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we do not provide password', (done) => {
            let user = {
                email: "test@example.com",
                // password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as user not found', (done) => {
            let user = {
                email: "nobody@example.com",
                password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 incorrect password', (done) => {
            let user = {
                email: "test@example.com",
                password: "wrongpassword",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 201 HAPPY PATH', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/v2/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("type");
                    res.body.data.type.should.equal("success");
                    res.body.data.should.have.property("type");

                    done();
                });
        });
    });
});
