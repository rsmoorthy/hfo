var axios = require('axios')
var rp = require('request-promise-native')
var R = require('ramda')
var moment = require('moment')

var cfg = require('../config')

const extractFlightData = flights => {
  var result = []
  R.forEach(flight => {
    result.push({
      ident: flight.ident,
      faFlightID: flight.faFlightID,
      tailNumber: flight.tailnumber,
      flight: flight.airline_iata + '' + flight.flightnumber,
      note: flight.origin.airport_name + ' to ' + flight.destination.airport_name + '\n' + flight.status,
      arrivalTime: flight.status + '\nETA: ' + flight.estimated_arrival_time.time,
      from: flight.origin.airport_name,
      fromCode: flight.origin.alternate_ident,
      fromCity: flight.origin.city,
      to: flight.destination.airport_name,
      toCity: flight.destination.city,
      toCode: flight.destination.alternate_ident,
      cancelled: flight.cancelled,
      diverted: flight.diverted,
      departureDelay: flight.departure_delay,
      arrivalDelay: flight.arrival_delay,
      status: flight.status,
      progress: flight.progress_percent,
      scheduledDeparture: moment.unix(flight.filed_departure_time.epoch).utc(),
      scheduledArrival: moment.unix(flight.filed_arrival_time.epoch).utc(),
      actualDeparture: moment.unix(flight.actual_departure_time.epoch).utc(),
      etaArrival: moment.unix(flight.estimated_arrival_time.epoch).utc(),
      actualArrival: moment.unix(flight.actual_arrival_time.epoch).utc(),
      eta_date: flight.estimated_arrival_time.date,
      eta_time: flight.estimated_arrival_time.time
    })
  }, flights)

  return result
}

export const getAirportBoards = async airport => {
  airport = airport || 'VOBL'
  var config = await cfg.getConfig()

  var enroute = await rp.post({
    uri: 'https://flightxml.flightaware.com/json/FlightXML3/AirportBoards',
    form: {
      airport_code: airport,
      type: 'enroute',
      howMany: '8'
    },
    json: true,
    auth: {
      user: config.flightaware.user,
      pass: config.flightaware.pass
    },
    rejectUnauthorized: false
  })

  var arrivals = await rp.post({
    uri: 'https://flightxml.flightaware.com/json/FlightXML3/AirportBoards',
    form: {
      airport_code: airport,
      type: 'arrivals',
      howMany: '8'
    },
    json: true,
    auth: {
      user: config.user,
      pass: config.pass
    },
    rejectUnauthorized: false
  })

  var response = []

  response = response.concat(extractFlightData(arrivals.AirportBoardsResult.arrivals.flights))
  response = response.concat(extractFlightData(enroute.AirportBoardsResult.enroute.flights))

  return response
}

export const getFlightInfoStatus = async (icaoFlightNumber, arrivalDate = moment()) => {
  arrivalDate = arrivalDate instanceof moment ? arrivalDate : moment(arrivalDate)
  var config = await cfg.getConfig()

  let err
  var details = await rp
    .post({
      uri: 'https://flightxml.flightaware.com/json/FlightXML3/FlightInfoStatus',
      form: {
        ident: icaoFlightNumber,
        howMany: '15'
      },
      json: true,
      auth: {
        user: config.flightaware.user,
        pass: config.flightaware.pass
      },
      rejectUnauthorized: false
    })
    .catch(e => (err = e.message))

  if (err) return [err]
  if (details.error) return [details.error]

  var response = []
  response = response.concat(
    extractFlightData(
      R.filter(
        // TODO: For now hard code to BLR
        flight => {
          return (
            flight.destination.alternate_ident === 'BLR' &&
            arrivalDate.dayOfYear() === moment.unix(flight.filed_arrival_time.epoch).dayOfYear()
          )
        },
        details.FlightInfoStatusResult.flights
      )
    )
  )
  return [null, response.length === 1 ? response[0] : []]
}

export const getFlightTrack = async faFlightID => {
  var config = await cfg.getConfig()
  var track = await rp.post({
    uri: 'https://flightxml.flightaware.com/json/FlightXML3/GetFlightTrack',
    form: {
      ident: faFlightID
    },
    json: true,
    auth: {
      user: config.flightaware.user,
      pass: config.flightaware.pass
    },
    rejectUnauthorized: false
  })

  var response = []
  let len = track.GetFlightTrackResult.tracks.length
  return response
}
