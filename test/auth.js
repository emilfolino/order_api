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
        it('should get 401 as we do not provide an email address', (done) => {
            chai.request(server)
                .get("/api_key")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a("object");
                    res.body.errors.status.should.be.eql(401);
                    done();
                });
        });

        it('should get 401 as we do not provide a valid email address', (done) => {
            chai.request(server)
                .get("/api_key?email=test")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a("object");
                    res.body.errors.status.should.be.eql(401);
                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/api_key?email=test@auth.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.data.should.be.a("object");
                    res.body.data.should.have.property("key");

                    apiKey = res.body.data.key;

                    done();
                });
        });

        it('should get 200 email already used', (done) => {
            chai.request(server)
                .get("/api_key?email=test@auth.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.data.should.be.a("object");
                    res.body.data.should.have.property("apiKey");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.equal(
                        "Email address already used for api key."
                    );

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
                .post("/register")
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
                .post("/register")
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
                .post("/register")
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
                .post("/register")
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
                .post("/login")
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
                .post("/login")
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
                .post("/login")
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
                .post("/login")
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
                .post("/login")
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
                .post("/login")
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
