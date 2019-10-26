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

        // Get user from user id in jwt payload
        const decodedJwt = jwt.verify(authToken, process.env.SC_JWT_SECRET || '123456')
        const userId = decodedJwt.hasOwnProperty("userId") ? decodedJwt.userId : null
        const user = userId ? await User.findById(userId) : null

        currentUser = !user
          ? currentUser
          : {
            id: user._id,
            name: user.name,
            email: user.email,
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
