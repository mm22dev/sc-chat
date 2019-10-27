const User = require('../../models/User')
const Channel = require('../../models/Channel')
const Message = require('../../models/Message')
const validator = require('validator')
const { makeRequestPrivate, ObjectId } = require('../../utils/lib')

// @desc    Create channel
// @access  Private
const createChannel = makeRequestPrivate(
  async (parent, { channelName }, { currentUser }) => {
    try {

      // Simple Validation
      const name = channelName.trim()
      if(validator.isEmpty(name)) throw new Error('Pleaes insert a channel name')
      const channelWithSameName = await Channel.findOne({ name })
      if(channelWithSameName) throw new Error('Channel name already in use')

      // Store incoming Channel
      const newChannel = await new Channel({ 
        name, 
        authorId: ObjectId(currentUser.id),
        members: [ObjectId(currentUser.id)]
      }).save()
      if(!newChannel) throw new Error('Error storing new channel')

      // Return stored Channel
      const { _id, authorId, createdAt } = newChannel
      const createdBy = { ...currentUser }
      return Promise.resolve({ id: _id, name, authorId: authorId.toString(), createdBy, createdAt })      

    } catch (err) {
      throw err
    }
  }
)

// @desc    Delete channel
// @access  Private
const deleteChannel = makeRequestPrivate(
  async (parent, { channelId }, { currentUser }) => {
    try {

      // Simple validation
      if(validator.isEmpty(channelId)) throw new Error('Please insert channel id')
      const channelMatch = await Channel.findById(channelId)
      if(!channelMatch) throw new Error('Please enter a valid channel id')
      if(channelMatch.authorId.toString()!==currentUser.id.toString()) throw new Error("Operation allowed for author's channel only")

      // Remove channel's messages
      const messages = await Message.find({ channelId: ObjectId(channelId) }, { _id: 1 })
      const messageIdList = messages.map(message => ObjectId(message._id))
      const removedMessages = await Message.deleteMany({ _id: { $in:  messageIdList }})
      if(!removedMessages) throw new Error("Error removing channel's messages")

      // Remove channel and return it
      return Channel.findOneAndRemove({ _id: ObjectId(channelId) })

    } catch (err) {
      throw err
    }
  }
)

// @desc    Set channel accessibility
// @access  Private
const setChannelAccessibility = makeRequestPrivate(
  async (parent, { channelId, accessibility }, { currentUser }) => {
    try {
      
      // Simple validation
      if(accessibility!=='PUBLIC' && accessibility!=='PRIVATE') throw new Error('Please send a valid accessibility')
      const channel = await Channel.findById(channelId)
      if(!channel) throw new Error('Please insert a valid channel id')
      if(channel.authorId.toString()!==currentUser.id.toString()) throw new Error("Operation allowed for author's channel only")

      // Update channel accessibility and return it
      return Channel.findOneAndUpdate({ _id: ObjectId(channelId) }, { $set: { accessibility } }, { new: true })

    } catch (err) {
      throw err    
    }
  }
)

// @desc    Invite user to channel
// @access  Private
const inviteUserToChannel = makeRequestPrivate(
  async (parent, { channelId, email }, { currentUser }) => {
    try {
      
      // Simple validation
      const channel = await Channel.findById(channelId)
      if(!channel) throw new Error('Please insert a valid channel id')
      if(channel.accessibility==='PUBLIC') throw new Error('Cannot invite users in public channels')
      const user = await User.findOne({ email })
      if(!validator.isEmail(email)) throw new Error('Please insert a valid email address')
      if(channel.authorId.toString()===user._id.toString()) throw new Error('Author of the channel no need invitation')
      if(!user) throw new Error('User email is not valid')
      if(channel.authorId.toString()!==currentUser.id.toString()) throw new Error("Operation allowed for author's channel only")
      if(channel.members.find( member => member.toString()===user._id.toString() )) throw new Error("User already invited")

      // Update channel and return it
      const updatedChannel = await Channel.findOneAndUpdate(
        { _id: channelId }, 
        { members: [...channel.members, ObjectId(user._id)] }, 
        { new: true }
      )
      if(!updatedChannel) throw new Error('Cannot store user the channel members')

      // Return invited user
      return Promise.resolve({ id: user._id, name: user.name })

    } catch (err) {
      throw err
    }
  }
)

// @desc    Kick out user from channel
// @access  Private
const kickOutUserFromChannel = makeRequestPrivate(
  async (parent, { channelId, email }, { currentUser }) => {
    try {

      // Simple validation
      const channel = await Channel.findById(channelId)
      if(!channel) throw new Error('Please insert a valid channel id')
      if(channel.accessibility==='PUBLIC') throw new Error('Cannot kick out users from public channels')
      const user = await User.findOne({ email })
      if(!validator.isEmail(email)) throw new Error('Please insert a valid email address')
      if(channel.authorId.toString()===user._id.toString()) throw new Error('Author of the channel cannot be kicked out')
      if(!user) throw new Error('User email is not valid')
      if(channel.authorId.toString()!==currentUser.id.toString()) throw new Error("Operation allowed for author's channel only")
      if(!channel.members.find( member => member.toString()===user._id.toString() )) throw new Error("The user is not a member of this channel")

      // Update channel
      const updatedChannel = await Channel.findOneAndUpdate(
        { _id: channelId }, 
        { members: channel.members.filter( member => member.toString()!==user._id.toString() ) },
        { new: true }
      )
      if(!updatedChannel) throw new Error('Cannot remove user from channel members')

      // Return kicked out user
      return Promise.resolve({ id: user._id, name: user.name })

    } catch (err) {
      throw err
    }
  }
)

module.exports = { 
  createChannel,
  deleteChannel,
  setChannelAccessibility,
  inviteUserToChannel,
  kickOutUserFromChannel
}
