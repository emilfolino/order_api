const db = require("./database.js")
const hat = require("hat")
const validator = require("email-validator")

module.exports = (function () {
    function isValidAPIKey (api_key, next, res) {
        db.get("SELECT email FROM apikeys WHERE key = ?", api_key, (err, row) => {
            if (row !== undefined) {
                return next()
            }

            res.status(401).json({ msg : "No valid API key provided" })
        })
    }

    function getNewAPIKey (res, email) {
        if (email === undefined || !validator.validate(email)) {
            res.json({ msg : "A valid email address is required to obtain an API key."})
        } else {
            db.get("SELECT email FROM apikeys WHERE email = ?", email, (err, row) => {
                if (row === undefined) {
                    const api_key = getUniqueAPIKey(res, email)
                } else {
                    res.json({ msg : "Email address already used for api key." })
                }
            })
        }
    }

    function getUniqueAPIKey (res, email) {
        const api_key = hat()
        db.get("SELECT key FROM apikeys WHERE key = ?", api_key, (err, row) => {
            if (row === undefined) {
                db.run("INSERT INTO apikeys (key, email) VALUES (?, ?)", api_key, email, (err) => {
                    res.json({ key : api_key })
                })
            } else {
                getUniqueAPIKey(res, email)
            }
        })
    }

    return {
        isValidAPIKey : isValidAPIKey,
        getNewAPIKey : getNewAPIKey,
    }
}())
