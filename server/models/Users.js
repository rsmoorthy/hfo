var mongoose = require('mongoose')

var UsersSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  password: String,
  expoToken: String,
  role: { type: String, enum: ['Admin', 'Passenger', 'Receiver', 'BookingAgent', 'Display'] },
  updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Users', UsersSchema)
