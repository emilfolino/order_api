var sqlite3 = require('sqlite3').verbose();

module.exports = (function () {
    if (process.env.NODE_ENV === 'test') {
        return new sqlite3.Database('./v1/db/test.sqlite');
    }

    return new sqlite3.Database('./v1/db/orders.sqlite');
}());
