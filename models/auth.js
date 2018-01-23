const db = require("../db/database.js");
const hat = require("hat");
const validator = require("email-validator");

module.exports = (function () {
    function isValidAPIKey(apiKey, next, path, res) {
        db.get("SELECT email FROM apikeys WHERE key = ?", apiKey, (err, row) => {
            if (err) {
                res.status(401).json({
                    errors: {
                        status: 401,
                        source: path,
                        title: "Database error",
                        detail: err.message
                    }
                });
                return;
            }

            if (row !== undefined) {
                return next();
            }

            res.status(401).json({
                errors: {
                    status: 401,
                    source: path,
                    title: "Valid API key",
                    detail: "No valid API key provided."
                }
            });
        });
    }

    function getNewAPIKey(res, path, email) {
        if (email === undefined || !validator.validate(email)) {
            res.status(401).json({
                errors: {
                    status: 401,
                    source: path,
                    title: "Valid email",
                    detail: "A valid email address is required to obtain an API key."
                }
            });
        } else {
            db.get("SELECT email, key FROM apikeys WHERE email = ?", email, (err, row) => {
                if (err) {
                    res.status(401).json({
                        errors: {
                            status: 401,
                            source: path,
                            title: "Database error",
                            detail: err.message
                        }
                    });
                    return;
                }

                if (row !== undefined) {
                    res.json({
                        data: {
                            message: "Email address already used for api key.",
                            apiKey: row.key
                        }
                    });
                    return;
                }

                getUniqueAPIKey(res, path, email);
            });
        }
    }

    function getUniqueAPIKey(res, path, email) {
        const apiKey = hat();

        db.get("SELECT key FROM apikeys WHERE key = ?", apiKey, (err, row) => {
            if (err) {
                res.status(401).json({
                    errors: {
                        status: 401,
                        source: path,
                        title: "Database error",
                        detail: err.message
                    }
                });
                return;
            }

            if (row === undefined) {
                db.run("INSERT INTO apikeys (key, email) VALUES (?, ?)",
                    apiKey,
                    email, (err) => {
                        if (err) {
                            res.status(401).json({
                                errors: {
                                    status: 401,
                                    source: path,
                                    title: "Database error",
                                    detail: err.message
                                }
                            });
                            return;
                        }

                        res.json({ data: { key: apiKey }});
                    });
            } else {
                getUniqueAPIKey(res, email);
            }
        });
    }

    return {
        isValidAPIKey: isValidAPIKey,
        getNewAPIKey: getNewAPIKey,
    };
}());
