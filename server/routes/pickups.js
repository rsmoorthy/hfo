var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var Pickups = require('../models/Pickups')
var Users = require('../models/Users')
var R = require('ramda')
var utils = require('../utils')
var flightstats = require('../services/flightstats')

var cache = { time: 0, data: [] }

/* Get list */
router.get('/', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var q = {}
  if (user.role === 'Agent') q.agentId = user.id
  else if (user.role === 'Receiver') q.receiverId = user.id
  else if (user.role === 'Passenger') q.passengerId = user.id
  var ret = await Pickups.find(q)
    .sort({ pickupDate: -1 })
    .exec()
  if (ret) {
    for (var p of ret) {
      if (p.name === null && p.passengerId) {
        let u = await Users.findById(p.passengerId).exec()
        if (u) {
          p.name = u.name
          p.mobile = u.mobile
          p.email = u.email
          p.photo = u.photo
          p.rating = u.rating
          p.pickups = u.pickups
        }
      } else if (p.passengerId === null) {
      }
    }
    return res.json({ status: 'ok', pickups: ret })
  } else res.json({ status: 'ok', pickups: [] })
})

/* Add */
router.post('/', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var inp = req.body
  let err,
    fl
    // Check if the flight is available now
  ;[err, fl] = await flightstats.getSchedule(inp.flight, inp.pickupDate)
  console.log(inp.pickupDate)
  if (err) return res.json({ status: 'error', message: err + '\nPlease enter the correct flight number' })
  if (inp.airport === 'Bangalore' && fl.toCode !== 'BLR')
    return res.json({ status: 'error', message: fl.message + '\nFlight does not land in Bangalore' })
  console.log(fl)
  inp.pickupDate = fl.scheduledArrival.toString()

  // Update passengerId if possible
  if (inp.passengerId === null && (inp.email || inp.mobile)) {
    let q = {}
    var ret
    if (inp.email) q.email = inp.email
    if (inp.mobile) q.mobile = inp.mobile
    ret = await Users.findOne(q).exec()
    if (ret) inp.passengerId = ret._id
  }
  var newPickup = new Pickups(inp)
  ret = await newPickup.save()
  if (ret._id) return res.json({ status: 'ok', id: ret._id, message: fl.message, flight: fl })
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

  // Update passengerId if possible
  if (inp.passengerId === null && (inp.email || inp.mobile)) {
    let q = {}
    if (inp.email) q.email = inp.email
    if (inp.mobile) q.mobile = inp.mobile
    ret = await Users.findOne(q).exec()
    if (ret) inp.passengerId = ret._id
  }

  ret = await Pickups.findByIdAndUpdate(id, inp).exec()
  if (ret) return res.json({ status: 'ok' })
  res.json({ status: 'error', message: 'Unable to update the record' })
})

/* Complete */
router.put('/complete/:id', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var inp = req.body
  var id = req.params.id
  var ret

  var upd = { receiverCompleted: new Date(), completed: 'Yes' }

  ret = await Pickups.findByIdAndUpdate(id, upd).exec()
  if (ret) return res.json({ status: 'ok' })
  res.json({ status: 'error', message: 'Unable to complete' })
})

module.exports = router
