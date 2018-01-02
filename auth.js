const db = require("./database.js")

module.exports = (function () {
    function isValidAPIKey (api_key, next, res) {
        db.get("SELECT email FROM apikeys WHERE key = ?", api_key, function (err, row) {
            if (row !== undefined) {
                return next()
            }

            res.status(401).json({ msg : "No valid API key provided" })
        })
    }

    function getNewAPIKey (res, email) {
        db.get("SELECT email FROM apikeys WHERE email = ?", email, function (err, row) {
            if (row === undefined) {
                const api_key = createAPIKey();
            } else {
                res.json({ msg : "Email address already used for api key." })
            }
        })
    }

    function createAPIKey () {
        return "ccccbbbbb3333";
    }

    return {
        isValidAPIKey : isValidAPIKey,
        getNewAPIKey : getNewAPIKey,
    }
}())
