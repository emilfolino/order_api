const {
    GraphQLObjectType,
    GraphQLList,
} = require('graphql');

const productModel = require("../models/products.js");

const ProductType = require("./product.js");

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        products: {
            type: GraphQLList(ProductType),
            description: 'List of all products for given user',
            resolve: async function(obj, args, request) {
                return await productModel.getAllProducts(request.body.api_key);
            }
        }
    })
});


module.exports = RootQueryType;
