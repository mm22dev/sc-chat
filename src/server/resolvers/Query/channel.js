const Channel = require('../../models/Channel')

// @desc    List channels
// @access  Public
const listChannels = () => Channel.find().sort({ createdAt: -1 })   

module.exports = { listChannels }
