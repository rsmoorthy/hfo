var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var Users = require('../models/Users')
var R = require('ramda')
var crypto = require('crypto')

/* GET ALL Users */
router.get('/', async (req, res, next) => {
  var ret = await Users.find({}, { name: 1, email: 1, mobile: 1, role: 1 }).exec()
  return res.json({ status: 'ok', users: ret === null ? [] : ret })
})

router.post('/update/:id', async (req, res, next) => {
  var inp = req.body
  var id = req.params.id

  console.log('step 1', id, inp)
  for (var key in inp) if (inp[key] === '' || inp[key] === null) delete inp[key]
  delete inp._id

  console.log('step 2', id, inp)
  if (inp.password && inp.password !== null && inp.password.length) {
    inp.password = crypto
      .createHash('md5')
      .update(inp.password)
      .digest('hex')
  }

  var ret = await Users.findOneAndUpdate(id, inp).exec()
  if (ret) return res.json({ status: 'ok' })
  return res.json({ status: 'error', message: 'Unable to update the User record' })
})

module.exports = router
