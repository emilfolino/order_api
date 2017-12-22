module.exports = (function () {
    function isValidAPIKey (api_key) {
        return api_key === "test123"
    }

    function getNewAPIKey (email) {
        return "test123"
    }

    return {
        isValidAPIKey : isValidAPIKey,
        getNewAPIKey : getNewAPIKey,
    }
}())
