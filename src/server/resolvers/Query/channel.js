const Channel = require('../../models/Channel')

// @desc    List channels
// @access  Public
const listChannels = () => Channel.find()

module.exports = { listChannels }
