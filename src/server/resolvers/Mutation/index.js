const { signUp, confirmRegistration, recoverPassword, updateUserAccount, deleteUserAccount } = require('./user')
const { createChannel, deleteChannel, setChannelAccessibility, inviteUserToChannel, kickOutUserFromChannel } = require('./channel')
const { createMessage, updateOwnMessage, deleteOwnMessage } = require('./message')

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
