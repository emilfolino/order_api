process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const should = chai.should();

chai.use(chaiHttp);


describe('products', () => {
    describe('GET /products', () => {
        it('it should GET all the products', (done) => {
            chai.request(server)
                .get("/products")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.data.should.be.a("array");
                    res.body.data.length.should.be.eql(0);
                    done();
                });
        });
    });
});
