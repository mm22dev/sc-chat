const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RegistrationSchema = new Schema({
  token: {
    type: String,
    require: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    require: true,
    unique: true
  }
})

const Registration = mongoose.model('registration', RegistrationSchema)

module.exports = Registration
