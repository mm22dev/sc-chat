const Channel = require('../../models/Channel')
const Message = require('../../models/Message')
const validator = require('validator')
const { ObjectId, makeRequestPrivate } = require('../../utils/lib')

// @desc    List channel messages
// @access  Private
const listChannelMessages = makeRequestPrivate(
  async (_, { channelId }, { currentUser }) => {
    try {
      // Check channel restrictions
      const channel = await Channel.findById(channelId)
      if(!channel) throw new Error('Please insert a valid channel id')
      const { accessibility, members } = channel
      if(accessibility==='PRIVATE' && !members.find( member => member.toString() === currentUser.id.toString())) throw new Error('Cannot get messages from private channel')

      // Return channel messages
      return Message.find({ channelId: ObjectId(channelId) }) 
    } catch (error) {
      throw err
    }
  }
)

// @desc    Filter messages
// @access  Private
const filterMessages = makeRequestPrivate(
  async (_, { channelId, author, text }, { currentUser }) => {
    try {

      // Simple validation
      const content = text.trim()
      if(validator.isEmpty(channelId)) throw new Error('Please insert a channel id')
      const channel = await Channel.findById(channelId)
      if(!channel) throw new Error('Please insert a valid channel id')
      const { accessibility, members } = channel
      if(accessibility==='PRIVATE' && !members.find( member => member.toString() === currentUser.id.toString())) throw new Error('Cannot filter messages in a private channel')
      if(validator.isEmpty(author.trim()) && validator.isEmpty(content)) throw new Error('Please insert at least one filter value')

      // Set db lookup and filters
      const lookup = { from: "users", localField: "authorId", foreignField: "_id", as: "authorName" }
      const filterByAuthor = { ...(author && { 'authorName.name': { $regex: author, $options: 'i' } }) }
      const filterByContent = { ...(content && { content: { $regex: content, $options: 'i' } }) }

      // Get matching messages
      const messages = await Message
        .aggregate([
          { $lookup: lookup },
          { $unwind: '$authorName' },
          { $match: { ...filterByAuthor, ...filterByContent }}
        ])
        
      // Return matching messages  
      return Promise.resolve(messages.map( message => ({id: message._id, ...message }) ))

    } catch (err) {
      throw err
    }
  }
)

module.exports = { listChannelMessages, filterMessages }