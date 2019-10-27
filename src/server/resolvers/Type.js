const { GraphQLScalarType } = require('graphql')
const User = require('../models/User')
const Channel = require('../models/Channel')

module.exports = {

  // Custom scalar for handling datetime
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  }),

  // Channel edge to get channel's author and memberList
  Channel: {
    createdBy: parent => User.findById(parent.authorId),
    memberList: async parent => {
      const channel = await Channel.findById(parent.id)
      return User.find({ _id: { $in: channel.members } })
    }
  },

  // Message edge to get message's author
  Message: {
    writtenBy: parent => User.findById(parent.authorId)
  }

}
