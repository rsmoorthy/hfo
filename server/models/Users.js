var mongoose = require('mongoose')

var UsersSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  password: String,
  expoToken: String,
  lastSeen: { type: Date },
  authCode: String,
  accessToken: String,
  photo: String,
  rating: Number,
  pickups: Number,
  pickupsWithRating: Number,
  disabled: String,
  role: { type: String, enum: ['Admin', 'Passenger', 'Receiver', 'Agent', 'Display'] },
  created_at: { type: Date },
  updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Users', UsersSchema)
