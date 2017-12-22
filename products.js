module.exports = (function () {
    function allProducts () {
        return [
            { name : "Screw", product_id : 1 },
            { name : "Bolt", product_id: 2}
        ]
    }

    return {
        getAllProducts : allProducts
    }
}())
