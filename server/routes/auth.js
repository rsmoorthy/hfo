var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var Users = require('../models/Users')
var R = require('ramda')
var crypto = require('crypto')

var cache = { time: 0, data: [] }

/* Signup */
router.post('/signup', async function(req, res, next) {
  var inp = req.body
  var ret
  ret = await Users.findOne({ email: inp.email }).exec()
  if (ret !== null) return res.json({ status: 'error', message: 'Email id ' + inp.email + ' already registered' })
  ret = await Users.findOne({ mobile: inp.mobile }).exec()
  if (ret !== null) return res.json({ status: 'error', message: 'Mobile number ' + inp.mobile + ' already registered' })

  inp.password = crypto
    .createHash('md5')
    .update(inp.password)
    .digest('hex')

  var newuser = new Users(inp)
  ret = await newuser.save()
  if (ret._id) return res.json({ status: 'ok', message: ret._id })
  res.json({ status: 'error', message: 'testing' })
})

/* Login */
router.post('/login', async function(req, res, next) {
  var inp = req.body
  console.log(inp)
  var ret
  ret = await Users.findOne({ email: inp.email }).exec()
  if (ret === null) ret = await Users.findOne({ mobile: inp.email }).exec()
  if (ret === null) return res.json({ status: 'error', message: 'Invalid Login Credentials' })

  if (
    ret.password !==
    crypto
      .createHash('md5')
      .update(inp.password)
      .digest('hex')
  )
    return res.json({ status: 'error', message: 'Invalid login credentials' })

  // eslint-disable-next-line
  if (ret.expoToken != inp.expoToken) {
    console.log('updating ', ret.id, ' with ', inp.expoToken)
    await Users.findOneAndUpdate(ret.id, { expoToken: inp.expoToken })
  }

  return res.json({
    status: 'ok',
    value: {
      id: ret.id,
      token: ret.token,
      name: ret.name,
      email: ret.email,
      mobile: ret.mobile,
      role: ret.role
    }
  })
})
module.exports = router
