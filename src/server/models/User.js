const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true
  },
  isVerified: {
    type: Boolean,
    require: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    require: true
  },
  updatedAt: {
    type: Date
  }
})

const User = mongoose.model('user', UserSchema)

module.exports = User
