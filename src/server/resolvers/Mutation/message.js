const Channel = require('../../models/Channel')
const Message = require('../../models/Message')
const validator = require('validator')
const { makeRequestPrivate, ObjectId, getMetadataList } = require('../../utils/lib')

// @desc    Insert new message
// @access  Private
const createMessage = makeRequestPrivate(
  async (parent, { channelId, text }, { currentUser }) => {
    try {

      // Simple validation
      const content = text.toString().trim()
      if(validator.isEmpty(content)) throw new Error('Please send not empty messages')
      const channel = await Channel.findById(channelId)
      if(!channel) throw new Error('Please insert a valid channel id')

      // Check user permissions
      const { accessibility, members } = channel
      if(accessibility==='PRIVATE' && !members.find( member => member.toString() === currentUser.id.toString())) throw new Error('Cannot write messages in a private channel')

      // Get any url metadata
      const metadataList = await getMetadataList(content)
      
      // Store Message
      const newMessage = await new Message({ 
        content, 
        authorId: ObjectId(currentUser.id), 
        channelId: ObjectId(channelId) ,
        ...(metadataList && { metadataList })
      }).save()
      if(!newMessage) throw new Error('Error storing message')

      // Return stored message
      const { _id, authorId } = newMessage
      const writtenBy = { ...currentUser }
      return Promise.resolve({ id: _id, content, channelId, authorId, writtenBy })
      
    } catch (err) {
      throw err
    }
  }
)

// @desc    Update own message
// @access  Private
const updateOwnMessage = makeRequestPrivate(
  async (parent, { messageId, text }, { currentUser }) => {
    try {

      // Simple validation
      const content = text.toString().trim()
      const message = await Message.findById(messageId)
      if(!message) throw new Error('Message id is not valid')
      if(message.authorId.toString()!==currentUser.id.toString()) throw new Error('Cannot update messages written by other user')
      if(validator.isEmpty(content)) throw new Error('Please send not empty messages')

      // Get any url metadata
      const metadataList = await getMetadataList(content)

      // Update Message
      return Message.findOneAndUpdate(
        { _id: message._id }, 
        { content, ...(metadataList && { metadataList }), updatedAt: Date.now() }, 
        { new: true } 
      )
      
    } catch (err) {
      throw err
    }
  }
)

// @desc    Delete own message
// @access  Private
const deleteOwnMessage = makeRequestPrivate(
  async (parent, { messageId }, { currentUser }) => {
    try {

      // Simple validation
      const message = await Message.findById(messageId)
      if(!message) throw new Error('Message id is not valid')
      if(message.authorId.toString()!==currentUser.id.toString()) throw new Error('Cannot remove messages written by other user')

      // Remove message and return it
      return Message.findOneAndRemove({ _id: messageId }) 
      
    } catch (err) {
      throw err
    }
  }
)

module.exports = { 
  createMessage,
  updateOwnMessage,
  deleteOwnMessage
}
