var mongoose = require('mongoose')

var PickupsSchema = new mongoose.Schema({
  agentId: String,
  passengerId: String,
  receiverId: String,
  sponsoredBy: String,
  name: String,
  email: String,
  mobile: String,
  airport: String,
  flight: String,
  pickupDate: Date,
  completed: String,
  receiverCompleted: Date,
  passengerCompleted: Date,
  status: { type: String, enum: ['New', 'Assigned', 'Completed'] },
  updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Pickups', PickupsSchema)
