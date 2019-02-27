const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const v1 = require("./v1/index.js");
const v2 = require("./v2/index.js");

const app = express();

app.use(cors());
app.options('*', cors());

app.disable('x-powered-by');

app.set("view engine", "ejs");

const port = 8111;

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, "public")));

app.use("/v2", v2);

app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/public/base.html')));

app.use("/", v1);

const server = app.listen(port, () => console.log('Order api listening on port ' + port));

module.exports = server;
