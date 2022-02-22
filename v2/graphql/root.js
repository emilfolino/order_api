const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
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
                console.log(request.body);
                // return await courses.getAll();
            }
        }
    })
});


module.exports = RootQueryType;
