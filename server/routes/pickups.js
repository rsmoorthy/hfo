var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var Pickups = require('../models/Pickups')
var Users = require('../models/Users')
var R = require('ramda')
var utils = require('../utils')

var cache = { time: 0, data: [] }

/* Get list */
router.get('/', async function(req, res, next) {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var q = {}
  if (user.role === 'BookingAgent') q.bookingAgentId = user.id
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
        }
      }
    }
    return res.json({ status: 'ok', pickups: ret })
  } else res.json({ status: 'error', message: 'testing' })
})

/* Add */
router.post('/', async function(req, res, next) {
  var inp = req.body
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
  if (ret._id) return res.json({ status: 'ok', message: ret._id })
  res.json({ status: 'error', message: 'testing' })
})

/* Update */
router.put('/:id', async function(req, res, next) {
  var inp = req.body
  var id = req.params.id
  var ret

  console.log('step 1', id, inp)
  for (var key in inp) if (inp[key] === '' || inp[key] === null) delete inp[key]
  delete inp._id

  console.log('step 2', id, inp)
  // Update passengerId if possible
  if (inp.passengerId === null && (inp.email || inp.mobile)) {
    let q = {}
    if (inp.email) q.email = inp.email
    if (inp.mobile) q.mobile = inp.mobile
    ret = await Users.findOne(q).exec()
    if (ret) inp.passengerId = ret._id
  }

  ret = await Pickups.findOneAndUpdate(id, inp).exec()
  if (ret) return res.json({ status: 'ok' })
  res.json({ status: 'error', message: 'Unable to update the record' })
})

module.exports = router
