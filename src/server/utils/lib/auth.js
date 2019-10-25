const jwt = require('jsonwebtoken')
const User = require('../../models/User')

const verifyAuthToken = async (token) => {  
  try {

    // By default user is unauthenticated
    let authToken = null,
    currentUser = null

    // If token is provided and is valid, provide token and authenticated user to Apollo Server ctx
    if(token){  
      try {
        
        authToken = token

        // Get userId from jwt payload
        const { userId } = jwt.verify(authToken, process.env.SC_JWT_SECRET || '123456')
        const user = await User.findById(userId)

        currentUser = !user
          ? currentUser
          : {
            id: user._id,
            name: user.name,
            isVerified: user.isVerified
          }  

      } catch (err) {
        console.error(err)
      }
    }

    return Promise.resolve({ authToken, currentUser })
  } catch (err) {
    throw err
  }
}

const makeRequestPrivate = next => (parent, args, ctx) => {
  if (!ctx.currentUser) throw new Error('To perform this operation you must be authenticated')
  if (!ctx.currentUser.isVerified) throw new Error('Account not confirmed. An email confirmation has been sent to your primary email address. Please check your inbox and click the confirmation link')
  return next(parent, args, ctx)
}

module.exports = { verifyAuthToken, makeRequestPrivate }
