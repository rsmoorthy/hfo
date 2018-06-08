var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var Users = require('../models/Users')
var R = require('ramda')
var utils = require('../utils')
var crypto = require('crypto')

/* GET ALL Users */
router.get('/', async (req, res, next) => {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var ret = await Users.find({}, { name: 1, email: 1, mobile: 1, role: 1 }).exec()
  return res.json({ status: 'ok', users: ret === null ? [] : ret })
})

router.post('/update/:id', async (req, res, next) => {
  var user = await utils.getLoginUser(req)
  if (!('role' in user)) return res.json({ status: 'error', message: 'Invalid Login Token' })

  var inp = req.body
  var id = req.params.id

  for (var key in inp) if (inp[key] === '' || inp[key] === null) delete inp[key]
  delete inp._id

  if (inp.password && inp.password !== null && inp.password.length) {
    inp.password = crypto
      .createHash('md5')
      .update(inp.password)
      .digest('hex')
  }

  var ret = await Users.findByIdAndUpdate(id, inp).exec()
  if (ret) return res.json({ status: 'ok' })
  return res.json({ status: 'error', message: 'Unable to update the User record' })
})

module.exports = router
