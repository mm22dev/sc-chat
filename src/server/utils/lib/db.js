const mongoose = require('mongoose')

// Trick the deprecation as expressed by Mongoose documentation
mongoose.set('useFindAndModify', false)

const mongoDBPrefix = process.env.SC_MONGODB_PREFIX || 'mongodb'
const mongoDBUsr = process.env.SC_MONGODB_USR ? `${process.env.SC_MONGODB_USR}:` : ''
const mongoDBPsw = process.env.SC_MONGODB_PSW ? `${process.env.SC_MONGODB_PSW}@` : ''
const mongoDBHost = process.env.SC_MONGODB_HOST || 'localhost'
const mongoDBPort = process.env.SC_MONGODB_PORT ? `${process.env.SC_MONGODB_PORT}` : '27017'
const mongoDBDatabase = process.env.SC_MONGODB_DATABASE || 'sc_chat'
const mongoDBOptions = process.env.SC_MONGODB_OPTIONS ? `?${process.env.SC_MONGODB_OPTIONS}` : ''
const mongoDBConnectionString = `${mongoDBPrefix}://${mongoDBUsr}${mongoDBPsw}${mongoDBHost}:${mongoDBPort}/${mongoDBDatabase}${mongoDBOptions}`

const connectToMongoDB = async () => await mongoose
  .connect(
    mongoDBConnectionString,
    {
      useNewUrlParser: true,
      useCreateIndex: true
    }
  )
  .then( () => console.log('MongoDB connected ...'))
  .catch( err => console.log(err) )

const ObjectId = stringId => mongoose.Types.ObjectId(stringId)

module.exports = { connectToMongoDB, ObjectId }
