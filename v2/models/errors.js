const errors = {
    sendError: function sendError(res, error) {
        return res.status(error.status || 500).json(error);
    }
};

module.exports = errors;
