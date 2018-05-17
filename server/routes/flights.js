var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var R = require('ramda')

var cache = { time: 0, data: [] }

/* GET ALL Flights */
router.get('/', function(req, res, next) {
  console.log(cache.time)
  if (new Date().getTime() - cache.time < 6000 * 1000) {
    console.log('returning cached date')
    res.json(cache.data)
    return
  }
  rp
    .post({
      uri: 'https://flightxml.flightaware.com/json/FlightXML3/AirportBoards',
      form: {
        airport_code: 'VOBL',
        type: 'enroute',
        howMany: '8'
      },
      json: true,
      auth: {
        user: 'rsmoorthy',
        pass: '98015841be8a873a23c0ff9f03cb54de60cbbc07'
      },
      rejectUnauthorized: false
    })
    .then(response => {
      var flights = []
      console.log(response.AirportBoardsResult)
      R.forEach(flight => {
        flights.push({
          flight: flight.airline_iata + ' ' + flight.flightnumber,
          note: flight.origin.airport_name + ' to ' + flight.destination.airport_name + '\n' + flight.status,
          arrivalTime: flight.status + '\nETA: ' + flight.estimated_arrival_time.time,
          from: flight.origin.airport_name,
          fromCode: flight.origin.alternate_ident,
          to: flight.destination.airport_name,
          toCode: flight.destination.alternate_ident,
          arrivalDelay: flight.arrival_delay,
          status: flight.status,
          progress: flight.progress_percent,
          eta_date: flight.estimated_arrival_time.date,
          eta_time: flight.estimated_arrival_time.time
        })
      }, response.AirportBoardsResult.enroute.flights)

      cache.time = new Date().getTime()
      cache.data = flights
      res.json(flights)
    })
    .catch(err => console.log('rp error', err))

  /*
  res.json([
    { flight: '6E 703', note: 'New Delhi to Bangalore', arrivalTime: 'ETA 16:40' },
    { flight: 'AI 501', note: 'Hyderabad to Bangalore', arrivalTime: 'Arrived at 16:20' },
    { flight: 'SG 116', note: 'Mumbai to Bangalore', arrivalTime: 'Arrived 16:35. Taxiing' },
    { flight: 'BA 562', note: 'London to Bangalore', arrivalTime: 'ETA 16:40 (Delayed)' }
  ])
  */
})

const getFlightDetails = async type => {
  var response = await rp.post({
    uri: 'https://flightxml.flightaware.com/json/FlightXML3/AirportBoards',
    form: {
      airport_code: 'VOBL',
      type: type,
      howMany: '8'
    },
    json: true,
    auth: {
      user: 'rsmoorthy',
      pass: '98015841be8a873a23c0ff9f03cb54de60cbbc07'
    },
    rejectUnauthorized: false
  })

  var flights
  R.forEach(flight => {
    flights.push({
      flight: flight.airline_iata + ' ' + flight.flightnumber,
      note: flight.origin.airport_name + ' to ' + flight.destination.airport_name + '\n' + flight.status,
      arrivalTime: flight.status + '\nETA: ' + flight.estimated_arrival_time.time,
      from: flight.origin.airport_name,
      fromCode: flight.origin.alternate_ident,
      to: flight.destination.airport_name,
      toCode: flight.destination.alternate_ident,
      arrivalDelay: flight.arrival_delay,
      status: flight.status,
      progress: flight.progress_percent,
      eta_date: flight.estimated_arrival_time.date,
      eta_time: flight.estimated_arrival_time.time
    })
  }, response.AirportBoardsResult[type].flights)

  return flights
}

module.exports = router
