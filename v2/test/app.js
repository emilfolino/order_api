/* global it describe */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');

const HTMLParser = require('node-html-parser');

chai.should();

chai.use(chaiHttp);

let apiKey = "";

describe('app', () => {
    describe('GET /', () => {
        it('200 HAPPY PATH getting base', (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('200 HAPPY PATH getting docs', (done) => {
            chai.request(server)
                .get("/v2")
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/v2/order")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@app.com",
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

        it('404 not found for invalid GET route', (done) => {
            chai.request(server)
                .get("/v2/order?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(404);

                    done();
                });
        });

        it('404 not found for invalid GET route', (done) => {
            chai.request(server)
                .get("/v2/order?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(404);

                    done();
                });
        });

        it('404 not found for invalid POST route', (done) => {
            chai.request(server)
                .post("/v2/copy/products")
                .send({ api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(404);

                    done();
                });
        });
    });
});
