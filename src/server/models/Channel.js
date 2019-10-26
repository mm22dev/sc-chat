const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChannelSchema = new Schema({
  authorId: {
    type: Schema.Types.ObjectId,
    require: true
  },
  name: {
    type: String,
    require: true,
    unique: true
  },
  accessibility: {
    type: String,
    require: true,
    default: 'PUBLIC'
  },
  members: {
    type: Array,
    require: true,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    require: true
  }
})

const Channel = mongoose.model('channel', ChannelSchema)

module.exports = Channel
