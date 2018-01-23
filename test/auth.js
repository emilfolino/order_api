process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const should = chai.should();

const db = require("../db/database.js");

chai.use(chaiHttp);

describe('auth', () => {
    before(() => {
        db.run("DELETE FROM apiKeys", (err) => {
            if (err) {
                console.log("Could not empty test DB", err.message);
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
                    done();
                });
        });
    });
});
