var axios = require('axios')
var rp = require('request-promise')
var R = require('ramda')
var moment = require('moment')

var config = require('../config')['flightstats']

const extractFlightData = flights => {
  var result = []
  R.forEach(flight => {
    result.push({
      ident: flight.ident,
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
      scheduledDeparture: moment.unix(flight.filed_departure_time.epoch),
      scheduledArrival: moment.unix(flight.filed_arrival_time.epoch),
      actualDeparture: moment.unix(flight.actual_departure_time.epoch),
      etaArrival: moment.unix(flight.estimated_arrival_time.epoch),
      actualArrival: moment.unix(flight.actual_arrival_time.epoch),
      eta_date: flight.estimated_arrival_time.date,
      eta_time: flight.estimated_arrival_time.time
    })
  }, flights)

  return result
}

export const getSchedule = async (flight, arrivalDate = moment()) => {
  var ad = typeof arrivalDate === 'object' ? arrivalDate : moment(arrivalDate)

  // curl -v  -X GET "https://api.flightstats.com/flex/schedules/rest/v1/json/flight/6E/347/arriving/2018/06/01?appId=30ca01e5&appKey=f5095c7feb99698d483b5d5ddd25bf56&extendedOptions=includeNewFields"
  var schedule = await rp.get({
    uri:
      'https://api.flightstats.com/flex/schedules/rest/v1/json/flight/' +
      flight.substr(0, 2) +
      '/' +
      flight.substr(2) +
      '/arriving/' +
      ad.year() +
      '/' +
      (ad.month() + 1) +
      '/' +
      ad.date(),
    qs: {
      appId: config.appId,
      appKey: config.appKey,
      extendedOptions: 'includeNewFields'
    }
  })

  schedule = JSON.parse(schedule)
  var fl = schedule.scheduledFlights[0]
  return {
    flight: fl.carrierFsCode + fl.flightNumber,
    fromCode: fl.departureAirportFsCode,
    toCode: fl.arrivalAirportFsCode,
    scheduledDeparture: moment(fl.departureTime),
    scheduledArrival: moment(fl.arrivalTime)
  }
}

export const getFlightStatus = async (flight, arrivalDate = moment()) => {
  var ad = typeof arrivalDate === 'object' ? arrivalDate : moment(arrivalDate)

  // curl -v  -X GET "https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/6E/347/arr/2018/06/01?appId=30ca01e5&appKey=f5095c7feb99698d483b5d5ddd25bf56&utc=false&airport=BLR"
  var status = await rp.get({
    uri:
      'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/' +
      flight.substr(0, 2) +
      '/' +
      flight.substr(2) +
      '/arr/' +
      ad.year() +
      '/' +
      (ad.month() + 1) +
      '/' +
      ad.date(),
    qs: {
      appId: config.appId,
      appKey: config.appKey,
      extendedOptions: 'includeNewFields'
    }
  })

  status = JSON.parse(status)
  var fl = status.flightStatuses[0]
  return {
    flight: fl.carrierFsCode + fl.flightNumber,
    fromCode: fl.departureAirportFsCode,
    toCode: fl.arrivalAirportFsCode,
    scheduledDeparture: moment(fl.operationalTimes.publishedDeparture.dateUtc),
    scheduledArrival: moment(fl.operationalTimes.publishedArrival.dateUtc),
    actualDeparture: fl.operationalTimes.actualGateDeparture
      ? moment(fl.operationalTimes.actualGateDeparture.dateUtc)
      : '',
    actualArrival: fl.operationalTimes.actualGateArrival ? moment(fl.operationalTimes.actualGateArrival.dateUtc) : '',
    etaArrival: fl.operationalTimes.estimatedGateArrival
      ? moment(fl.operationalTimes.estimatedGateArrival.dateUtc)
      : '',
    departureDelay: fl.delays.departureGateDelayMinutes * 60,
    arrivalDelay: fl.delays.arrivalGateDelayMinutes * 60
  }
}

export const getFlightTrack = async (flight, arrivalDate = moment()) => {
  var ad = typeof arrivalDate === 'object' ? arrivalDate : moment(arrivalDate)

  // curl -v  -X GET "https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/6E/347/arr/2018/06/01?appId=30ca01e5&appKey=f5095c7feb99698d483b5d5ddd25bf56&utc=false&airport=BLR"
  // curl -v  -X GET "https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/tracks/6E/347/arr/2018/06/01?appId=30ca01e5&appKey=f5095c7feb99698d483b5d5ddd25bf56&utc=false&includeFlightPlan=false&airport=BLR&maxPositions=10"
  var status = await rp.get({
    uri:
      'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/tracks/' +
      flight.substr(0, 2) +
      '/' +
      flight.substr(2) +
      '/arr/' +
      ad.year() +
      '/' +
      (ad.month() + 1) +
      '/' +
      ad.date(),
    qs: {
      appId: config.appId,
      appKey: config.appKey,
      maxPositions: 1,
      extendedOptions: 'includeNewFields'
    }
  })

  status = JSON.parse(status)
  var fl = status.flightTracks[0]
  return {
    flight: fl.carrierFsCode + fl.flightNumber,
    fromCode: fl.departureAirportFsCode,
    toCode: fl.arrivalAirportFsCode,
    scheduledDeparture: moment(fl.departureDate.dateUtc),
    position: fl.positions.length ? fl.positions[0] : {}
  }
}
