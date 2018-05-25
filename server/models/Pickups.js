var mongoose = require('mongoose')

var PickupsSchema = new mongoose.Schema({
  bookingAgentId: String,
  passengerId: String,
  receiverId: String,
  sponsoredBy: String,
  name: String,
  email: String,
  mobile: String,
  airport: String,
  flight: String,
  pickupDate: Date,
  pickupTime: Date,
  completed: String,
  receiverCompleted: Date,
  passengerCompleted: Date,
  updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Pickups', PickupsSchema)
