var sqlite3 = require('sqlite3').verbose();

module.exports = (function () {
    return new sqlite3.Database('./db/orders.sqlite');
}());
