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
  carrierName: String,
  carrierICAO: String,
  pickupDate: Date,
  completed: String,
  receiverCompleted: Date,
  passengerCompleted: Date,

  fromCode: String,
  fromAirport: String,
  fromCity: String,
  fromPosition: String,
  toCode: String,
  toAirport: String,
  toCity: String,
  toPosition: String,
  scheduledDeparture: Date,
  scheduledArrival: Date,

  cancelled: String,
  flightStatus: String,
  flightProgress: String,
  actualDeparture: Date,
  actualArrival: Date,
  etaArrival: Date,
  departureDelay: String,
  arrivalDelay: String,

  status: { type: String, enum: ['New', 'Assigned', 'Arrived', 'Completed'] },
  sentInitialMailSMS: Date,
  sentReminderMailSMS: Date,
  updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Pickups', PickupsSchema)
