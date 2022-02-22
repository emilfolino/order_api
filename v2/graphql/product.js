const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLFloat,
} = require('graphql');

const ProductType = new GraphQLObjectType({
    name: 'Product',
    description: 'This represents a product',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        article_number: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        specifiers: { type: GraphQLNonNull(GraphQLString) },
        stock: { type: GraphQLNonNull(GraphQLInt) },
        location: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLNonNull(GraphQLFloat) },
    })
})

module.exports = ProductType;
