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
  completedDate: Date,
  receiverCompleted: Date,
  passengerCompleted: Date,

  feedback: String,
  rating: Number,

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

  position: String,
  flightStatsLastUpdated: Date,

  cancelled: String,
  flightStatus: String,
  flightProgress: String,
  actualDeparture: Date,
  actualArrival: Date,
  etaArrival: Date,
  departureDelay: String,
  arrivalDelay: String,
  flightAwareLastUpdated: Date,

  arrivalBay: String,
  status: { type: String, enum: ['New', 'Assigned', 'Arrived', 'Completed'] },
  sentInitialMailSMS: Date,
  sentReminderMailSMS: Date,
  completedMailSMS: Date,
  updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Pickups', PickupsSchema)
