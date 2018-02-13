const db = require("../db/database.js");
const hat = require("hat");
const validator = require("email-validator");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = "c4e8dc1598a01222005681f11d07c653";

module.exports = (function () {
    function isValidAPIKey(apiKey, next, path, res) {
        db.get("SELECT email FROM apikeys WHERE key = ?", apiKey, (err, row) => {
            if (err) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: path,
                        title: "Database error",
                        detail: err.message
                    }
                });
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
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: path,
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                if (row !== undefined) {
                    return res.json({
                        data: {
                            message: "Email address already used for api key.",
                            apiKey: row.key
                        }
                    });
                }

                getUniqueAPIKey(res, path, email);
            });
        }
    }

    function getUniqueAPIKey(res, path, email) {
        const apiKey = hat();

        db.get("SELECT key FROM apikeys WHERE key = ?", apiKey, (err, row) => {
            if (err) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: path,
                        title: "Database error",
                        detail: err.message
                    }
                });
            }

            if (row === undefined) {
                db.run("INSERT INTO apikeys (key, email) VALUES (?, ?)",
                    apiKey,
                    email, (err) => {
                        if (err) {
                            return res.status(401).json({
                                errors: {
                                    status: 401,
                                    source: path,
                                    title: "Database error",
                                    detail: err.message
                                }
                            });
                        }

                        res.json({ data: { key: apiKey }});
                    });
            } else {
                getUniqueAPIKey(res, email);
            }
        });
    }

    function login(res, body) {
        const email = body.email;
        const password = body.password;
        const apiKey = body.api_key;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        db.get("SELECT * FROM users WHERE apiKey = ? AND email = ?",
            apiKey,
            email,
            (err, rows) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/login",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                if (rows === undefined) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "/login",
                            title: "User not found",
                            detail: "User with provided email not found."
                        }
                    });
                }

                const user = rows;

                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/login",
                                title: "bcrypt error",
                                detail: "bcrypt error"
                            }
                        });
                    }

                    if (result) {
                        return res.json({
                            data: {
                                type: "success",
                                message: "User logged in",
                                user: {api_key: user.apiKey, email: user.email},
                                token: jwt.sign({
                                    api_key: user.apiKey,
                                    email: user.email},
                                    jwtSecret)
                            }
                        })
                    } else {
                        return res.status(401).json({
                            errors: {
                                status: 401,
                                source: "/login",
                                title: "Wrong password",
                                detail: "Password is incorrect."
                            }
                        });
                    }
                });
            });
    }

    function register(res, body) {
        const email = body.email;
        const password = body.password;
        const apiKey = body.api_key;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }

            db.run("INSERT INTO users (apiKey, email, password) VALUES (?, ?, ?)",
                apiKey,
                email,
                hash, (err) => {
                    if (err) {
                        return res.status(401).json({
                            errors: {
                                status: 401,
                                source: "/register",
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    }

                    res.status(201).json({
                        data: {
                            message: "User successfully registered."
                        }
                    });
                });
        });
    }

    function checkToken(req, res, next) {
        var token = req.headers['x-access-token'];

        if (token) {
            jwt.verify(token, jwtSecret, function(err, decoded) {
                if (err) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: req.path,
                            title: "Failed authentication",
                            detail: err.message
                        }
                    });
                }

                req.user = {};
                req.user.api_key = decoded.api_key;
                req.user.email = decoded.email;

                next();
            });
        } else {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: req.path,
                    title: "No token",
                    detail: "No token provided in request headers"
                }
            });
        }
    }

    return {
        isValidAPIKey: isValidAPIKey,
        getNewAPIKey: getNewAPIKey,
        login: login,
        register: register,
        checkToken: checkToken
    };
}());
