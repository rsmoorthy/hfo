var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var Pickups = require('../models/Pickups')
var Users = require('../models/Users')
var R = require('ramda')
var utils = require('../utils')
var flightstats = require('../services/flightstats')
var flightaware = require('../services/flightaware')
var sms = require('../services/sms')
var email = require('../services/email')
var notifications = require('../services/notifications')
var ejs = require('ejs')
var moment = require('moment')
// var config = require('../config')['global']

var cache = { time: 0, data: [] }

const addHours = (dt, h) => {
  dt.setHours(dt.getHours() + h)
  return dt
}

const today = dt => {
  dt.setHours(0)
  dt.setMinutes(0)
  dt.setSeconds(0)
  return dt
}

const eod = dt => {
  dt.setHours(23)
  dt.setMinutes(59)
  dt.setSeconds(59)
  return dt
}

/* remind */
router.get('/reminder/:scope/:id?', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })
  var id = req.params.id
  var scope = req.params.scope

  if (user.role !== 'Admin') return res.json({ status: 'error', message: 'Invalid Role' })

  var q = {}
  if (id) q._id = id
  else {
    if (scope === 'today') {
      q.status = { $in: ['New', 'Assigned'] }
      q.pickupDate = { $gt: new Date(), $lt: eod(new Date()) }
    } else if (scope === 'current') {
      q.status = { $in: ['New', 'Assigned'] }
      q.pickupDate = { $gt: new Date(), $lt: addHours(new Date(), 1) }
    } else return res.json({ status: 'error', message: 'invalid scope' })
  }

  if (user.role === 'Receiver') q.receiverId = user.id
  if (user.role === 'Passenger') q.passengerId = user.id
  var ret = await Pickups.find(q)
    .sort({ pickupDate: -1 })
    .exec()
  let ret2 = await Promise.all(
    ret.map(async p => {
      let p2 = { ...p._doc, receiver: {}, testing: 0 }
      // for (var p of ret) {
      if ((p.name === null || p.name === undefined) && p.passengerId) {
        let u = await Users.findById(p.passengerId).exec()
        if (u) {
          p2.name = u.name
          p2.mobile = u.mobile
          p2.email = u.email
          p2.photo = u.photo ? utils.getPhotoUrl(p.passengerId, u.photo) : ''
        }
      } else if (p.passengerId === null) {
      }

      if (p.receiverId) {
        let u = await Users.findById(p.receiverId).exec()
        p2.receiver = {
          name: u.name,
          mobile: u.mobile,
          email: u.email,
          photo: u.photo ? utils.getPhotoUrl(p.receiverId, u.photo) : '',
          role: u.role,
          rating: u.rating,
          pickups: u.pickups
        }
      }
      if (
        moment().diff(p2.scheduledDeparture, 'minutes') > 0 &&
        moment().date() - moment(p2.scheduledDeparture).date() >= 0 &&
        moment().date() - moment(p2.scheduledDeparture).date() <= 2 &&
        p2.flightProgress !== '100'
      ) {
        let [e, ret] = await flightstats.getFlightTrack(p2.flight, p2.scheduledArrival)
        if (ret && ret.position) {
          p2.position = ret.position
          await Pickups.findByIdAndUpdate(p2._id, { position: p2.position, flightStatsLastUpdated: new Date() })
        }
        let [e2, ret2] = await flightaware.getFlightInfoStatus(
          p2.carrierICAO ? p2.carrierICAO + p2.flight.substr(2) : p2.flight,
          p2.scheduledArrival
        )
        if (ret2) {
          p2.flightStatus = ret2.status
          p2.flightProgress = ret2.progress
          p2.actualDeparture = ret2.actualDeparture
          p2.actualArrival = ret2.actualArrival
          p2.etaArrival = ret2.etaArrival
          await Pickups.findByIdAndUpdate(p2._id, {
            flightStatus: p2.flightStatus,
            flightProgress: p2.flightProgress,
            actualArrival: p2.actualArrival,
            etaArrival: p2.etaArrival,
            flightAwareLastUpdated: new Date()
          })
        }
      }
      if (scope === 'today' && p2.receiverId && !p2.sentReminderPassenger) {
        let row = await constructRecord(p2)
        await notifications.notificationSend('ReminderPickupPassenger', row, row.passengerId)
        await Pickups.findByIdAndUpdate(p2._id, { sentReminderPassenger: new Date() })
        p2.sentReminderPassenger = new Date()
      }
      if (scope === 'current' && p2.receiverId && !p2.sentReminderReceiver) {
        let row = await constructRecord(p2)
        await notifications.notificationSend('ReminderPickupReceiver', row, row.receiverId)
        await Pickups.findByIdAndUpdate(p2._id, { sentReminderReceiver: new Date() })
        p2.sentReminderReceiver = new Date()
      }
      return p2
    })
  )
  if (id) return res.json({ status: 'ok', pickup: ret2[0] })
  return res.json({ status: 'ok', pickups: ret2 })
})

/* Get list or a single record */
router.get('/:scope/:id?', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })
  var id = req.params.id
  var scope = req.params.scope

  var q = {}
  if (id) q._id = id
  else {
    if (scope === 'past') q.status = 'Completed'
    else if (scope === 'today') {
      q.status = { $in: ['New', 'Assigned'] }
      q.pickupDate = { $gt: new Date(), $lt: eod(new Date()) }
    } else if (scope === 'current') {
      q.status = { $in: ['New', 'Assigned'] }
      q.pickupDate = { $gt: new Date(), $lt: addHours(new Date(), 1) }
    } else q.status = { $in: ['New', 'Assigned'] }
  }

  if (user.role === 'Agent') q.agentId = user.id
  if (user.role === 'Receiver') q.receiverId = user.id
  if (user.role === 'Passenger') q.passengerId = user.id
  var ret = await Pickups.find(q)
    .sort({ pickupDate: -1 })
    .exec()
  if (!ret) return res.json({ status: 'ok', pickups: [] })
  let ret2 = await Promise.all(
    ret.map(async p => {
      let p2 = { ...p._doc, receiver: {}, testing: 0 }
      // for (var p of ret) {
      if ((p.name === null || p.name === undefined) && p.passengerId) {
        let u = await Users.findById(p.passengerId).exec()
        if (u) {
          p2.name = u.name
          p2.mobile = u.mobile
          p2.email = u.email
          p2.photo = u.photo ? utils.getPhotoUrl(p.passengerId, u.photo) : ''
        }
      } else if (p.passengerId === null) {
      }

      if (p.receiverId) {
        let u = await Users.findById(p.receiverId).exec()
        p2.receiver = {
          name: u.name,
          mobile: u.mobile,
          email: u.email,
          photo: u.photo ? utils.getPhotoUrl(p.receiverId, u.photo) : '',
          role: u.role,
          rating: u.rating,
          pickups: u.pickups
        }
      }
      if (
        moment().diff(p2.scheduledDeparture, 'minutes') > 0 &&
        moment().date() - moment(p2.scheduledDeparture).date() >= 0 &&
        moment().date() - moment(p2.scheduledDeparture).date() <= 2 &&
        p2.flightProgress !== '100'
      ) {
        let [e, ret] = await flightstats.getFlightTrack(p2.flight, p2.scheduledArrival)
        if (ret && ret.position) {
          p2.position = ret.position
          await Pickups.findByIdAndUpdate(p2._id, { position: p2.position, flightStatsLastUpdated: new Date() })
        }
        let [e2, ret2] = await flightaware.getFlightInfoStatus(
          p2.carrierICAO ? p2.carrierICAO + p2.flight.substr(2) : p2.flight,
          p2.scheduledArrival
        )
        if (ret2) {
          p2.flightStatus = ret2.status
          p2.flightProgress = ret2.progress
          p2.actualDeparture = ret2.actualDeparture
          p2.actualArrival = ret2.actualArrival
          p2.etaArrival = ret2.etaArrival
          await Pickups.findByIdAndUpdate(p2._id, {
            flightStatus: p2.flightStatus,
            flightProgress: p2.flightProgress,
            actualArrival: p2.actualArrival,
            etaArrival: p2.etaArrival,
            flightAwareLastUpdated: new Date()
          })
        }
      }
      return p2
    })
  )
  if (id) return res.json({ status: 'ok', pickup: ret2[0] })
  return res.json({ status: 'ok', pickups: ret2 })
})

/* Add */
router.post('/', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var inp = req.body
  let [err, iret, fl] = await updateFlightSchedule(inp)
  if (err) return res.json({ status: 'error', message: err })
  inp = { ...iret }
  inp.status = inp.receiverId ? 'Assigned' : 'New'
  if (user.role === 'Agent' || user.role === 'Admin') inp.agentId = user._id

  // Update passengerId if possible
  if (inp.passengerId === null && (inp.email || inp.mobile)) {
    let q = {}
    var ret
    if (inp.email) q.email = inp.email
    if (inp.mobile) q.mobile = inp.mobile
    ret = await Users.findOne(q).exec()
    if (ret) inp.passengerId = ret._id
  }
  if (inp.receiverId) inp.arrivalBay = getArrivalBay()
  var newPickup = new Pickups(inp)
  ret = await newPickup.save()
  if (ret._id) {
    if (ret.receiverId && !ret.sentInitialMailSMS) {
      let row = await constructRecord(ret)
      await sms.smsSend('WelcomePassenger', row)
      await email.emailSend('WelcomePassenger', row)
      await sms.smsSend('NotifyReceiver', row)
      await notifications.notificationSend('WelcomePassenger', row, row.passengerId)
      await notifications.notificationSend('NotifyReceiver', row, row.receiverId)
      await Pickups.findByIdAndUpdate(ret._id, { sentInitialMailSMS: new Date() })
    }
    return res.json({ status: 'ok', id: ret._id, message: fl.message, flight: fl })
  }
  res.json({ status: 'error', message: 'testing' })
})

/* Update */
router.put('/:id', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var inp = req.body
  var id = req.params.id
  var ret

  for (var key in inp) if (inp[key] === '' || inp[key] === null) delete inp[key]
  delete inp._id

  var rec = await Pickups.findById(id).exec()
  if (inp.flight && rec.flight !== inp.flight) {
    let [err, iret, fl] = await updateFlightSchedule(inp)
    if (err) return res.json({ status: 'error', message: err })
    inp = { ...iret }
  }

  if (inp.receiverId && !rec.arrivalBay) {
    inp.status = rec.status === 'New' ? 'Assigned' : rec.status
    inp.arrivalBay = getArrivalBay()
  }

  // Update passengerId if possible
  if (inp.passengerId === null && (inp.email || inp.mobile)) {
    let q = {}
    if (inp.email) q.email = inp.email
    if (inp.mobile) q.mobile = inp.mobile
    ret = await Users.findOne(q).exec()
    if (ret) inp.passengerId = ret._id
  }

  ret = await Pickups.findByIdAndUpdate(id, inp).exec()
  if (ret) {
    ret = await Pickups.findById(id).exec()
    if (ret.receiverId && !ret.sentInitialMailSMS && (ret.status === 'New' || ret.status === 'Assigned')) {
      let row = await constructRecord(ret)
      await sms.smsSend('WelcomePassenger', row)
      await email.emailSend('WelcomePassenger', row)
      await sms.smsSend('NotifyReceiver', row)
      await notifications.notificationSend('WelcomePassenger', row, row.passengerId)
      await notifications.notificationSend('NotifyReceiver', row, row.receiverId)
      let upd = { sentInitialMailSMS: new Date() }
      if (ret.receiverId && ret.status === 'New') upd.status = 'Assigned'
      await Pickups.findByIdAndUpdate(ret._id, upd)
    }
    return res.json({ status: 'ok' })
  }
  res.json({ status: 'error', message: 'Unable to update the record' })
})

/* Complete */
router.put('/complete/:id', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var inp = req.body
  var id = req.params.id
  var ret, row

  row = await Pickups.findById(id).exec()
  var upd = {}
  if (row.status !== 'Completed') {
    upd.status = 'Completed'
    upd.completedDate = new Date()
  }
  if (row.receiverId === id && !row.receiverCompleted) upd.receiverCompleted = new Date()
  if (row.passengerId === id && !row.passengerCompleted) upd.passengerCompleted = new Date()
  if (inp.rating) upd.rating = inp.rating
  if (inp.feedback) upd.feedback = inp.feedback

  ret = await Pickups.findByIdAndUpdate(id, upd).exec()
  if (!ret) return res.json({ status: 'error', message: 'Unable to update record' })
  ret = await Pickups.findById(id).exec()

  // Increment pickups
  if (row.status !== 'Completed') {
    if (row.passengerId) {
      let count = await Pickups.count({ passengerId: row.passengerId, status: 'Completed' }).exec()
      if (count) await Users.findByIdAndUpdate(row.passengerId, { pickups: count }).exec()
    }
    if (row.receiverId) {
      let count = await Pickups.count({ receiverId: row.receiverId, status: 'Completed' }).exec()
      if (count) await Users.findByIdAndUpdate(row.receiverId, { pickups: count }).exec()
    }
    if (!row.completedMailSMS) {
      let row = await constructRecord(ret)
      await sms.smsSend('PassengerTripCompleted', row)
      await sms.smsSend('ReceiverTripCompleted', row)
      await email.emailSend('PassengerTripCompleted', row)
      await notifications.notificationSend('PassengerTripCompleted', row, row.passengerId)
      await notifications.notificationSend('ReceiverTripCompleted', row, row.receiverId)
      await notifications.notificationSend('ReceiverTripCompleted', row, row.agentId)
      await Pickups.findByIdAndUpdate(row._id, { completedMailSMS: new Date() })
    }
  }
  if (inp.rating && row.receiverId) {
    let urow = await Users.findById(row.receiverId).exec()
    let pickupsWithRating = await Pickups.count({
      status: 'Completed',
      receiverId: row.receiverId,
      rating: { $gt: 0 }
    }).exec()
    let newrating = inp.rating
    if (pickupsWithRating > 1 && urow.rating) {
      newrating = ((pickupsWithRating - 1) * urow.rating + inp.rating) / pickupsWithRating
      newrating = parseFloat(newrating.toFixed(2))
    }
    await Users.findByIdAndUpdate(row.receiverId, { rating: newrating }).exec()
  }
  return res.json({ status: 'ok' })
})

/* recompute rating, pickups */
router.put('/computeRating/:receiverId', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  // if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var inp = req.body
  var receiverId = req.params.receiverId
  var ret, row

  let [rating, pickups] = await computeRating(receiverId)
  return res.json({ status: 'ok', rating: rating, pickups: pickups })
})

const constructRecord = async row => {
  row = row._doc ? row._doc : row
  let p = { ...row, receiver: {}, testing: 0 }

  if ((p.name === null || p.name === undefined) && p.passengerId) {
    let u = await Users.findById(p.passengerId).exec()
    if (u) {
      p.name = u.name
      p.mobile = u.mobile
      p.email = u.email
      p.photo = u.photo ? utils.getPhotoUrl(p.passengerId, u.photo) : ''
    }
  } else if (p.passengerId === null) {
  }

  if (p.receiverId) {
    let u = await Users.findById(p.receiverId).exec()
    p.receiver = {
      name: u.name,
      mobile: u.mobile,
      email: u.email,
      photo: u.photo ? utils.getPhotoUrl(p.receiverId, u.photo) : '',
      rating: u.rating,
      pickups: u.pickups
    }
  }

  p.pickupDateFormat = p.pickupDate ? moment(p.pickupDate).format('Do MMM YYYY HH:mm') : ''
  p.completedDateFormat = p.completedDate ? moment(p.completedDate).format('Do MMM YYYY HH:mm') : ''
  return p
}

const updateFlightSchedule = async inp => {
  // Check if the flight is available now
  let [err, fl] = await flightstats.getSchedule(inp.flight, inp.pickupDate)
  if (err) return [err + '\nPlease enter the correct flight number']

  if (inp.airport === 'Bengaluru' && fl.toCode !== 'BLR') return [fl.message + '\nFlight does not land in Bengalure']

  inp.pickupDate = fl.scheduledArrival.toString()
  let fields = [
    'fromCode',
    'toCode',
    'fromAirport',
    'toAirport',
    'fromCity',
    'toCity',
    'carrierName',
    'carrierICAO',
    'scheduledDeparture',
    'scheduledArrival'
  ]
  fields.forEach(key => (inp[key] = fl[key]))
  inp.fromPosition = JSON.stringify(fl.fromPosition)
  inp.toPosition = JSON.stringify(fl.toPosition)

  return [null, inp, fl]
}

const getArrivalBay = pickupDate => {
  return 'A1'
}

const computeRating = async receiverId => {
  let urow = await Users.findById(receiverId).exec()
  let pickups = await Pickups.count({ status: 'Completed', receiverId: receiverId })

  var config = await utils.getConfig()

  if (pickups - (urow.pickupsWithRating || 0) > config.global.ratingAfterSoManyPickups) {
    let ratings = await Pickups.find({ status: 'Completed', receiverId: receiverId, rating: { $gt: 0 } }, { rating: 1 })

    let avg = R.pipe(
      R.map(R.prop('rating')),
      R.mean
    )(ratings)
    console.log('computeRating', avg, pickups)
    return [avg, pickups]
  } else {
    console.log('computeRating existing', urow.rating, pickups)
    return [urow.rating, pickups]
  }
}

module.exports = router
