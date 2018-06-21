var axios = require('axios')
var rp = require('request-promise')
var R = require('ramda')
var moment = require('moment')

var config = require('../config')['flightstats']

const getAirportData = (airports, key, airportCode) => {
  let airport = R.filter(R.propEq('fs', airportCode), airports)
  if (airport.length === 1) return airport[0][key]
  return ''
}

export const getSchedule = async (flight, arrivalDate = moment()) => {
  var ad = arrivalDate instanceof moment ? arrivalDate : moment(arrivalDate)

  // curl -v  -X GET "https://api.flightstats.com/flex/schedules/rest/v1/json/flight/6E/347/arriving/2018/06/01?appId=30ca01e5&appKey=f5095c7feb99698d483b5d5ddd25bf56&extendedOptions=includeNewFields"
  var schedule = await rp
    .get({
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
    .catch(err => [err.message])

  try {
    schedule = JSON.parse(schedule)
    if (schedule.scheduledFlights.length === 0) return ['No flight ' + flight + ' on ' + ad.format('DD MMM YYYY')]
  } catch (err) {
    return ['JSON error ' + err]
  }
  let flights = R.filter(val => val.arrivalAirportFsCode === 'BLR', schedule.scheduledFlights)
  if (flights.length === 0) return ['No flight ' + flight + ' on ' + ad.format('DD MMM YYYY')]
  var fl = flights[0]
  var airports = schedule.appendix.airports
  return [
    null,
    {
      flight: fl.carrierFsCode + fl.flightNumber,
      carrierName: schedule.appendix.airlines[0].name,
      carrierICAO: schedule.appendix.airlines[0].icao,
      fromCode: fl.departureAirportFsCode,
      toCode: fl.arrivalAirportFsCode,
      fromCity: getAirportData(airports, 'city', fl.departureAirportFsCode),
      toCity: getAirportData(airports, 'city', fl.arrivalAirportFsCode),
      fromAirport: getAirportData(airports, 'name', fl.departureAirportFsCode),
      toAirport: getAirportData(airports, 'name', fl.arrivalAirportFsCode),
      fromPosition: {
        latitude: getAirportData(airports, 'latitude', fl.departureAirportFsCode),
        longitude: getAirportData(airports, 'longitude', fl.departureAirportFsCode),
        elevation: getAirportData(airports, 'elevationFeet', fl.departureAirportFsCode),
        timezone: getAirportData(airports, 'timeZoneRegionName', fl.departureAirportFsCode),
        utcOffset: getAirportData(airports, 'utcOffsetHours', fl.departureAirportFsCode)
      },
      toPosition: {
        latitude: getAirportData(airports, 'latitude', fl.arrivalAirportFsCode),
        longitude: getAirportData(airports, 'longitude', fl.arrivalAirportFsCode),
        elevation: getAirportData(airports, 'elevationFeet', fl.arrivalAirportFsCode),
        timezone: getAirportData(airports, 'timeZoneRegionName', fl.arrivalAirportFsCode),
        utcOffset: getAirportData(airports, 'utcOffsetHours', fl.arrivalAirportFsCode)
      },
      scheduledDeparture: moment(fl.departureTime)
        .utcOffset(getAirportData(airports, 'utcOffsetHours', fl.departureAirportFsCode))
        .toString(),
      scheduledArrival: moment(fl.arrivalTime)
        .utcOffset(getAirportData(airports, 'utcOffsetHours', fl.arrivalAirportFsCode))
        .toString(),
      message:
        'Flight ' +
        fl.carrierFsCode +
        fl.flightNumber +
        ' from ' +
        fl.departureAirportFsCode +
        ' ( ' +
        moment(fl.departureTime).format('HH:mm') +
        ' ) to ' +
        fl.arrivalAirportFsCode +
        ' ( ' +
        moment(fl.arrivalTime).format('HH:mm') +
        ' )'
    }
  ]
}

export const getFlightStatus = async (flight, arrivalDate = moment()) => {
  var ad = arrivalDate instanceof moment ? arrivalDate : moment(arrivalDate)

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
  if(status.flightTracks.length === 0)
    return ['No flight tracks obtained']
  var fl = status.flightStatuses[0]
  return {
    flight: fl.carrierFsCode + fl.flightNumber,
    fromCode: fl.departureAirportFsCode,
    toCode: fl.arrivalAirportFsCode,
    scheduledDeparture: fl.operationalTimes.publishedDeparture.dateUtc,
    scheduledArrival: fl.operationalTimes.publishedArrival.dateUtc,
    actualDeparture: fl.operationalTimes.actualGateDeparture ? fl.operationalTimes.actualGateDeparture.dateUtc : '',
    actualArrival: fl.operationalTimes.actualGateArrival ? fl.operationalTimes.actualGateArrival.dateUtc : '',
    etaArrival: fl.operationalTimes.estimatedGateArrival ? fl.operationalTimes.estimatedGateArrival.dateUtc : '',
    departureDelay: fl.delays.departureGateDelayMinutes * 60,
    arrivalDelay: fl.delays.arrivalGateDelayMinutes * 60
  }
}

export const getFlightTrack = async (flight, arrivalDate = moment(), airport = 'BLR') => {
  var ad = arrivalDate instanceof moment ? arrivalDate : moment(arrivalDate)

  // curl -v  -X GET "https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/6E/347/arr/2018/06/01?appId=30ca01e5&appKey=f5095c7feb99698d483b5d5ddd25bf56&utc=false&airport=BLR"
  // curl -v  -X GET "https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/tracks/6E/347/arr/2018/06/01?appId=30ca01e5&appKey=f5095c7feb99698d483b5d5ddd25bf56&utc=false&includeFlightPlan=false&airport=BLR&maxPositions=10"
  let err
  var status = await rp
    .get({
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
        airport: airport,
        maxPositions: 1,
        extendedOptions: 'includeNewFields'
      }
    })
    .catch(e => (err = e.message))

  if (err) return [err]

  status = JSON.parse(status)
  if(status.flightTracks.length === 0)
    return ['No flight tracks obtained']
  var fl = status.flightTracks[0]
  var position = fl.positions && fl.positions.length ? fl.positions[0] : {}
  if (fl.positions && fl.positions.length) {
    position.latitude = position.lat
    position.longitude = position.lon
  }
  return [
    null,
    {
      flight: fl.carrierFsCode + fl.flightNumber,
      fromCode: fl.departureAirportFsCode,
      toCode: fl.arrivalAirportFsCode,
      scheduledDeparture: moment(fl.departureDate.dateUtc),
      position: JSON.stringify(position)
    }
  ]
}
