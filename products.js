module.exports = (function () {
    function getAllProducts () {
        return [
            { name : "Screw", product_id : 1 },
            { name : "Bolt", product_id: 2}
        ]
    }

    function getProduct (product_id) {
        return { name : "Screw", product_id : product_id }
    }

    return {
        getAllProducts : getAllProducts,
        getProduct : getProduct,
    }
}())
