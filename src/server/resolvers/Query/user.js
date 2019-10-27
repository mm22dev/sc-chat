const User = require('../../models/User')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

module.exports = { login }
