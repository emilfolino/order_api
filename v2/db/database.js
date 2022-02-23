const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const database = {
    openDb: async function openDb() {
        let dbFilename = "./v2/db/orders.sqlite";

        if (process.env.NODE_ENV === 'test') {
            dbFilename = "./v2/db/test.sqlite";
        }

        return await open({
            filename: dbFilename,
            driver: sqlite3.Database
        });
    }
};

module.exports = database;
