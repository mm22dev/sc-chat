const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto-random-string')
const User = require('../models/User')
const Registration = require('../models/Registration')
const { 
  sendVerificationEmail, 
  sendPasswordRecoveryEmail, 
  makeRequestPrivate, 
  ObjectId, 
  getMetadataList 
} = require('../utils/lib')
const Channel = require('../models/Channel')
const Message = require('../models/Message')

// @desc    Register user
// @access  Public
const signUp = async (parent, {name, email, password}) => {
  try {

    // Simple validation
    if(validator.isEmpty(name) || validator.isEmpty(email) || validator.isEmpty(password)) throw new Error('Please enter all fields')
    if(!validator.isEmail(email)) throw new Error('Please enter a valid email address')
    if(password.length<8) throw new Error('Password must be at least 8 characters')
    const alreadyRegisteredEmail = await User.findOne({email})
    if(alreadyRegisteredEmail) throw new Error('User already exists')
    
    // Store incoming user with hashed password
    const salt = await bcrypt.genSalt(10)       
    const hash = await bcrypt.hash(password, salt)
    const incomingUser = await new User({ name, email, password: hash }).save()

    // Store registration token and send email to confirm registration
    const registration = await new Registration({token: crypto(16), userId: incomingUser._id}).save()
    await sendVerificationEmail(name, email, registration.token)

    // Return registered user
    return Promise.resolve({ id: incomingUser._id, name: incomingUser.name })              

  } catch (err) {
    throw err
  }  
}

// @desc    Confirm user registration
// @access  Public
const confirmRegistration = async (parent, { token }) => {
  try {

    // Check for existing (unique) token and get related user id
    const { userId } = await Registration.findOneAndRemove({ token })
    if(!userId) throw new Error('No registration pending')

    return User.findOneAndUpdate(
      { _id: userId }, 
      { $set: { isVerified: true } }, 
      { new: true }
    )

  } catch (err) {
    throw err
  }
}

// @desc    Recovery lost password
// @access  Public
const recoverPassword = async (parent, { email }) => {
  try {

    // Simple validation
    if(!validator.isEmail(email)) throw new Error('Please enter a valid email address')
    
    // Generate new password
    const tmpPassword = crypto(8)
    const salt = await bcrypt.genSalt(10)       
    const tmpHashedPassword = await bcrypt.hash(tmpPassword, salt)

    // Store new password
    const carelessUser = await User.findOneAndUpdate(
      { email }, 
      { $set: { password: tmpHashedPassword, updatedAt: Date.now() } },
      { new: true }
    )
    if(!carelessUser) throw new Error('Operation denied')

    // Send email with temporary password
    await sendPasswordRecoveryEmail(carelessUser.name, carelessUser.email, tmpPassword)
    
    return Promise.resolve({ id: carelessUser.id, name: carelessUser.name })

  } catch (err) {
    throw err
  }

}

// @desc    Update user account
// @access  Private
const updateUserAccount = makeRequestPrivate(
  async (parent, { name, password }, { currentUser }) => {
    try {

      // Simple validation
      if(validator.isEmpty(name) && validator.isEmpty(password)) throw new Error('Please update at least one field')
      if(!validator.isEmpty(password) && password.length<8) throw new Error('Password must be at least 8 characters')

      // Hash password if supllied
      let hash = null
      if(password){
        const salt = await bcrypt.genSalt(10)       
        hash = await bcrypt.hash(password, salt)
      }

      // Update user and return it
      return User.findOneAndUpdate(
        { _id: currentUser.id },
        { $set: {
          ...(name && { name }), 
          ...(password && { password: hash })},
          ...((name || password) && { updatedAt: Date.now() })
        },
        { new: true }
      )

    } catch (err) {
      throw err
    }
  }
)

// @desc    Delete user account
// @access  Private
const deleteUserAccount = makeRequestPrivate(
  async(parent, { password }, { currentUser }) => {
    try {

      // Simple validation
      if(validator.isEmpty(password)) throw new Error('Please enter all fields')
      if(password.length<8) throw new Error('Incorrect password')

      // Matching password validation
      const userToRemove = await User.findById(currentUser.id)
      if(!userToRemove) throw new Error('Operation denied')
      const pswMatch = await bcrypt.compare(password, userToRemove.password)
      if(!pswMatch) throw new Error('Invalid password')

      // Remove user an return it
      return User.findOneAndRemove({ _id: currentUser.id })

    } catch (err) {
      throw err
    }
  }
)

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
      const { _id, authorId, messages, createdAt } = newChannel
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
  signUp, 
  confirmRegistration, 
  recoverPassword, 
  updateUserAccount, 
  deleteUserAccount, 
  createChannel,
  deleteChannel,
  setChannelAccessibility,
  inviteUserToChannel,
  kickOutUserFromChannel,
  createMessage,
  updateOwnMessage,
  deleteOwnMessage
}
