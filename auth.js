const db = require("./database.js")
const hat = require("hat")
const validator = require("email-validator")

module.exports = (function () {
    function isValidAPIKey (api_key, next, path, res) {
        db.get("SELECT email FROM apikeys WHERE key = ?", api_key, (err, row) => {
            if (row !== undefined) {
                return next()
            }

            res.status(401).json({errors : { status : 401, source : path, title : "Valid API key", detail : "No valid API key provided." }})
        })
    }

    function getNewAPIKey (res, path, email) {
        if (email === undefined || !validator.validate(email)) {
            res.status(401).json({errors : { status : 401, source : path, title : "Valid email", detail : "A valid email address is required to obtain an API key." }})
        } else {
            db.get("SELECT email, key FROM apikeys WHERE email = ?", email, (err, row) => {
                if (row !== undefined) {
                    res.json({data : { message : "Email address already used for api key.", api_key : row.key }})
                    return
                }

                const api_key = getUniqueAPIKey(res, email)
            })
        }
    }

    function getUniqueAPIKey (res, email) {
        const api_key = hat()
        db.get("SELECT key FROM apikeys WHERE key = ?", api_key, (err, row) => {
            if (row === undefined) {
                db.run("INSERT INTO apikeys (key, email) VALUES (?, ?)", api_key, email, (err) => {
                    res.json({ data : { key : api_key }})
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
