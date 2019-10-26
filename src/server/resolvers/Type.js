const { GraphQLScalarType } = require('graphql')
const User = require('../models/User')

module.exports = {

  // Custom scalar for handling datetime
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  }),

  // Channel edge to get channel's author
  Channel: {
    createdBy: parent => User.findById(parent.authorId)
  },

  // Message edge to get message's author
  Message: {
    writtenBy: parent => User.findById(parent.authorId)
  }

}
