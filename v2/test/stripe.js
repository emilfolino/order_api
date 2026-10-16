/* global it describe before */

process.env.NODE_ENV = 'test';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const HTMLParser = require('node-html-parser');

const server = require('../../app.js');

chai.should();

chai.use(chaiHttp);

let apiKey = "";

// Only input validation is tested here, as the happy paths need a real Stripe key.
describe('stripe', () => {
    before((done) => {
        chai.request(server)
            .post("/v2/auth/api_key/confirmation")
            .send({ email: "test@stripe.com", gdpr: "gdpr" })
            .end((err, res) => {
                const HTMLResponse = HTMLParser.parse(res.text);

                apiKey = HTMLResponse.querySelector('#apikey').childNodes[0].rawText;

                done();
            });
    });

    describe('POST /stripe/create-checkout-session', () => {
        it('should get 400 JSON error without items', (done) => {
            chai.request(server)
                .post("/v2/stripe/create-checkout-session")
                .send({ return_url: "https://example.com/order.html", api_key: apiKey })
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.errors.status.should.be.equal(400);
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });
    });

    describe('GET /stripe/session-status', () => {
        it('should get 400 JSON error without session_id', (done) => {
            chai.request(server)
                .get("/v2/stripe/session-status?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.errors.status.should.be.equal(400);
                    res.body.errors.should.have.property("detail");

                    done();
                });
        });
    });
});
