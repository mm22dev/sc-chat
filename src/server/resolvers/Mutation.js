const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto-random-string')
const User = require('../models/User')
const Registration = require('../models/Registration')
const { sendVerificationEmail, sendPasswordRecoveryEmail, makeRequestPrivate } = require('../utils/lib')

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

    // Update user's isVerified key to true
    const pendingUser = await User.findById(userId)
    pendingUser.isVerified = true
    await pendingUser.save()

    // Return user with verified account
    return Promise.resolve({ id: pendingUser._id, name: pendingUser.name })

  } catch (err) {
    throw err
  }
}

// @desc    Recovery lost password
// @access  Public
const recoverPassword = async (parent, { email }) => {
  try {

    // Simple validation
    if(validator.isEmpty(email)) throw new Error('Please enter email address')
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

      // Update user
      const updatedUser = await User.findOneAndUpdate(
        { _id: currentUser.id },
        { $set: {
          ...(name && { name }), 
          ...(password && { password: hash })},
          ...((name || password) && { updatedAt: Date.now() })
        },
        { new: true }
      )
      if(!updatedUser) throw new Error('Operation denied')

      // Return updated user
      return Promise.resolve({ id: updatedUser._id, name: updatedUser.name })

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

      // Remove user
      const removedUser = await User.findOneAndRemove({ _id: currentUser.id })

      // Return removed user
      return Promise.resolve({ id: removedUser._id, name: removedUser.name })

    } catch (err) {
      throw err
    }
  }
)

module.exports = { signUp, confirmRegistration, recoverPassword, updateUserAccount, deleteUserAccount }
