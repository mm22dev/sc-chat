const User = require('../models/User')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Channel = require('../models/Channel')
const { ObjectId, makeRequestPrivate } = require('../utils/lib')
const Message = require('../models/Message')

// @desc    Authenticate the user
// @access  Public
const login = async (parent, { email, password }) => {
  try {
    // Simple validation
    if(validator.isEmpty(email) || validator.isEmpty(password)) throw new Error('Please enter all fields')
    if(!validator.isEmail(email)) throw new Error('Please enter a valid email address')
    
    // Email validation
    const matchingUser = await User.findOne({ email })
    if(!matchingUser) throw new Error('E-mail mismatching')

    // Check for 
    if(!matchingUser.isVerified) throw new Error("An email confirmation has been sent to your primary email address. Please check your inbox and click the confirmation link")

    // Password validation
    const pswMatch = await bcrypt.compare(password, matchingUser.password)
    if(!pswMatch) throw new Error('Invalid credentials')

    // Generate token
    const token = await jwt.sign(
      { userId: matchingUser._id }, 
      process.env.SC_JWT_SECRET || '123456',
      { expiresIn: 7200 }
    )

    const user = { id: matchingUser._id, name: matchingUser.name }
    return Promise.resolve({ token, user })

  } catch (err) {
    throw err
  }

}

// @desc    List channels
// @access  Public
const listChannels = () => Channel.find()

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

module.exports = { login, listChannels, listChannelMessages, filterMessages }
