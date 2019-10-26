const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema = new Schema({
  channelId: {
    type: Schema.Types.ObjectId,
    require: true
  },
  authorId: {
    type: Schema.Types.ObjectId,
    require: true
  },
  content: {
    type: String,
    require: true,
  },
  metadataList: Array,
  writtenAt: {
    type: Date,
    default: Date.now,
    require: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const Message = mongoose.model('message', MessageSchema)

module.exports = Message
