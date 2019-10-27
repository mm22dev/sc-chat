const User = require('../../models/User')
const Registration = require('../../models/Registration')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto-random-string')
const { makeRequestPrivate, sendVerificationEmail, sendPasswordRecoveryEmail } = require('../../utils/lib')

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
    const registration = await Registration.findOneAndRemove({ token })
    if(!registration) throw new Error('No registration pending')

    return User.findOneAndUpdate(
      { _id: registration.userId }, 
      { $set: { isVerified: true } }, 
      { new: true }
    )

  } catch (err) {
    throw err
  }
}

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

    // Check user verification
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
    
    return Promise.resolve('Check your e-mail')

  } catch (err) {
    throw err
  }

}

// @desc    Update user account
// @access  Private
const updateUserAccount = makeRequestPrivate(
  async (parent, { newName, newPassword, currentPassword }, { currentUser }) => {
    try {

      // Simple validation
      if(validator.isEmpty(newName) && validator.isEmpty(newPassword)) throw new Error('Please update at least one field')
      if(!validator.isEmpty(newPassword) && newPassword.length<8) throw new Error('New password must be at least 8 characters')
      if(validator.isEmpty(currentPassword)) throw new Error('Plese provide current password to perform operation.')

      // Verify current password
      const matchingUser = await User.findOne({ email: currentUser.email })
      if(!matchingUser) throw new Error('Operation denied')
      const pswMatch = await bcrypt.compare(currentPassword, matchingUser.password)
      if(!pswMatch) throw new Error('The inserted current password is uncorrect')

      // Hash new password if supplied
      let hash = null
      if(newPassword){
        const salt = await bcrypt.genSalt(10)       
        hash = await bcrypt.hash(newPassword, salt)
      }

      // Update user and return it
      return User.findOneAndUpdate(
        { _id: currentUser.id },
        { $set: {
          ...(newName && { name: newName }), 
          ...(newPassword && { password: hash })},
          ...((newName || newPassword) && { updatedAt: Date.now() })
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

module.exports = { 
  signUp, 
  confirmRegistration, 
  login,
  recoverPassword, 
  updateUserAccount, 
  deleteUserAccount
}
