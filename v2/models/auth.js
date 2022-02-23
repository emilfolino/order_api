const database = require("../db/database.js");
const hat = require("hat");
const validator = require("email-validator");

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let config;

try {
    config = require('../../config/config.json');
} catch (error) {
    console.error(error);
}

const jwtSecret = process.env.JWT_SECRET || config.secret;

const auth = {
    checkAPIKey: function (req, res, next) {
        if ( req.path == '/') {
            return next();
        }

        if ( req.path == '/v2') {
            return next();
        }

        if ( req.path == '/auth/api_key') {
            return next();
        }

        if ( req.path == '/auth/api_key/confirmation') {
            return next();
        }

        if ( req.path == '/auth/api_key/deregister') {
            return next();
        }

        if ( req.path == '/products/everything') {
            return next();
        }

        return auth.isValidAPIKey(req.query.api_key || req.body.api_key, next, req.path, res, req);
    },

    isValidAPIKey: async function(apiKey, next, path, res, req) {
        try {
            const db = await database.openDb();
            const row = db.get(
                "SELECT email FROM apikeys WHERE key = ?",
                apiKey
            );

            if (row !== undefined) {
                req.api_key = apiKey;
                return next();
            }

            return {
                errors: {
                    status: 401,
                    source: path,
                    title: "Valid API key",
                    detail: "No valid API key provided."
                }
            };
        } catch (e) {
            return {
                errors: {
                    status: 500,
                    source: path,
                    title: "Database error",
                    detail: e.message
                }
            };
        } finally {
            await db.close();
        }
    },

    getNewAPIKey: async function(res, email) {
        let data = {
            apiKey: ""
        };

        if (email === undefined || !validator.validate(email)) {
            data.message = "A valid email address is required to obtain an API key.";
            data.email = email;

            return res.render("api_key/form", data);
        }

        try {
            const db = await database.openDb();
            const row = await db.get(
                "SELECT email, key FROM apikeys WHERE email = ?",
                email
            );

            if (row !== undefined) {
                data.apiKey = row.key;

                return res.render("api_key/confirmation", data);
            }

            return await auth.getUniqueAPIKey(res, email);
        } catch (e) {
            data.message = "Database error: " + e.message;
            data.email = email;

            return res.render("api_key/form", data);
        } finally {
            await db.close();
        }
    },

    getUniqueAPIKey: async function(res, email) {
        const apiKey = hat();
        let data = {
            apiKey: ""
        };

        try {
            const db = await database.openDb();
            const row = await db.get("SELECT key FROM apikeys WHERE key = ?", apiKey);

            if (row === undefined) {
                await db.run(
                    "INSERT INTO apikeys (key, email) VALUES (?, ?)",
                    apiKey,
                    email,
                );

                data.apiKey = apiKey;

                return res.render("api_key/confirmation", data);
            } else {
                return await auth.getUniqueAPIKey(res, email);
            }
        } catch (e) {
            data.message = "Database error: " + e.message;
            data.email = email;

            return res.render("api_key/form", data);
        } finally {
            await db.close();
        }
    },

    deregister: async function(res, body) {
        const email = body.email;
        const apiKey = body.apikey;

        try {
            const db = await database.openDb();
            const row = db.get(
                "SELECT key FROM apikeys WHERE key = ? and email = ?",
                apiKey,
                email,
            );

            if (row === undefined) {
                let data = {
                    message: "The E-mail and API-key combination does not exist.",
                    email: email,
                    apikey: apiKey
                };

                return res.render("api_key/deregister", data);
            }

            return await auth.deleteData(res, apiKey, email);
        } catch (e) {
            let data = {
                message: "Database error: " + e.message,
                email: email,
                apikey: apiKey
            };

            return res.render("api_key/deregister", data);
        } finally {
            await db.close();
        }
    },

    deleteData: async function(res, apiKey, email) {
        try {
            const db = database.openDb();

            await db.run("DELETE FROM apikeys WHERE key = ?", apiKey);
            await db.run("DELETE FROM deliveries WHERE apiKey = ?", apiKey);
            await db.run("DELETE FROM invoices WHERE apiKey = ?", apiKey);
            await db.run("DELETE FROM orders WHERE apiKey = ?", apiKey);
            await db.run("DELETE FROM order_items WHERE apiKey = ?", apiKey);
            await db.run("DELETE FROM products WHERE apiKey = ?", apiKey);
            await db.run("DELETE FROM users WHERE apiKey = ?", apiKey);

            let data = {
                message: "All data has been deleted",
                email: ""
            };

            return res.render("api_key/form", data);
        } catch (e) {
            let data = {
                message: "Could not delete data due to: " + e.message,
                email: email,
                apikey: apiKey,
            };

            return res.render("api_key/deregister", data);
        } finally {
            await db.close();
        }
    },

    login: async function(res, body) {
        const email = body.email;
        const password = body.password;
        const apiKey = body.api_key;

        if (!email || !password) {
            return {
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            };
        }

        try {
            const db = database.openDb();
            const rows = await db.get(
                "SELECT * FROM users WHERE apiKey = ? AND email = ?",
                apiKey,
                email,
            );

            if (rows === undefined) {
                return {
                    errors: {
                        status: 401,
                        source: "/login",
                        title: "User not found",
                        detail: "User with provided email not found."
                    }
                };
            }

            const user = rows;

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return {
                        errors: {
                            status: 500,
                            source: "/login",
                            title: "bcrypt error",
                            detail: "bcrypt error"
                        }
                    };
                }

                if (result) {
                    let payload = { api_key: user.apiKey, email: user.email };
                    let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

                    return {
                        data: {
                            type: "success",
                            message: "User logged in",
                            user: payload,
                            token: jwtToken
                        }
                    };
                }

                return {
                    errors: {
                        status: 401,
                        source: "/login",
                        title: "Wrong password",
                        detail: "Password is incorrect."
                    }
                };
            });
        } catch (e) {
            return {
                errors: {
                    status: 500,
                    source: "/login",
                    title: "Database error",
                    detail: e.message
                }
            };
        } finally {
            await db.close();
        }
    },

    register: async function(res, body) {
        const email = body.email;
        const password = body.password;
        const apiKey = body.api_key;

        if (!email || !password) {
            return {
                errors: {
                    status: 401,
                    source: "/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            };
        }

        bcrypt.hash(password, 10, async function(err, hash) {
            if (err) {
                return {
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                };
            }

            try {
                const db = await database.openDb();

                await db.run(
                    "INSERT INTO users (apiKey, email, password) VALUES (?, ?, ?)",
                    apiKey,
                    email,
                    hash,
                );

                return {
                    data: {
                        message: "User successfully registered."
                    }
                };
            } catch (e) {
                return {
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "Database error",
                        detail: e.message
                    }
                };
            } finally {
                await db.close();
            }
        });
    },

    checkToken: function(req, res, next) {
        const token = req.headers['x-access-token'];

        if (token) {
            jwt.verify(token, jwtSecret, function(err, decoded) {
                if (err) {
                    return {
                        errors: {
                            status: 500,
                            source: req.path,
                            title: "Failed authentication",
                            detail: err.message
                        }
                    };
                }

                req.user = {};
                req.user.api_key = decoded.api_key;
                req.user.email = decoded.email;

                return next();
            });
        } else {
            return {
                errors: {
                    status: 401,
                    source: req.path,
                    title: "No token",
                    detail: "No token provided in request headers"
                }
            };
        }
    }
};

module.exports = auth;
