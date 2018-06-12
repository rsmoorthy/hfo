var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var Users = require('../models/Users')
var R = require('ramda')
var crypto = require('crypto')
var ejs = require('ejs')
var path = require('path')
var emailaws = require('../services/emailaws')

var cache = { time: 0, data: [] }

const sendNewAccountSMS = async ({ id, name, mobile, authCode }) => {
  return ['SMS Not configured yet']
}

const sendNewAccountEmail = async ({ id, name, email, authCode }) => {
  let html = await ejs.renderFile(path.join(__dirname, '../templates/email_newaccount.ejs'), {
    id,
    name,
    authCode,
    email
  })

  let [err, out] = await emailaws.sendEmail({
    from: 'support@hfoinc.in',
    to: email,
    subject: 'Please verify your HFO account ',
    html: html
  })
  return [err, out]
}

/* Signup */
router.post('/signup', async function(req, res, next) {
  var inp = req.body
  var ret
  if (inp.email === null && inp.mobile === null)
    return res.json({ status: 'error', message: 'One of Email or Mobile should be specified' })
  if (inp.email) {
    ret = await Users.findOne({ email: inp.email }).exec()
    if (ret !== null && ret.authCode.length === 0)
      return res.json({ status: 'error', message: 'Email id ' + inp.email + ' already registered' })
  } else delete inp.email

  if (inp.mobile) {
    ret = await Users.findOne({ mobile: inp.mobile }).exec()
    if (ret !== null && ret.authCode.length === 0)
      return res.json({ status: 'error', message: 'Mobile number ' + inp.mobile + ' already registered' })
  } else delete inp.mobile

  inp.password = crypto
    .createHash('md5')
    .update(inp.password)
    .digest('hex')

  inp.authCode =
    Math.random()
      .toString(10)
      .substring(2, 5) +
    Math.random()
      .toString(10)
      .substring(2, 5)

  if (ret) {
    // update the db
    ret = await Users.findByIdAndUpdate(ret._id, inp)
  } else {
    // insert to  db
    var newuser = new Users(inp)
    ret = await newuser.save()
  }
  if (!ret) return res.json({ status: 'error', message: 'Unable to save to database' })

  if (ret.email) {
    let [err, mailret] = await sendNewAccountEmail({ ...ret._doc, id: ret._id, authCode: inp.authCode })
    if (err) return res.json({ status: 'error', message: 'Unable to send email: ' + err })
  }
  if (!ret.email && ret.mobile) {
    let [err, mailret] = await sendNewAccountSMS({ ...ret._doc, id: ret._id, authCode: inp.authCode })
    if (err) return res.json({ status: 'error', message: 'Unable to send SMS: ' + err })
  }
  return res.json({
    status: 'ok',
    value: {
      id: ret._id
    }
  })
})

/* SignupVerify */
router.post('/signupverify', async function(req, res, next) {
  var inp = req.body
  var ret
  ret = await Users.findOne({ _id: inp.id }).exec()
  if (ret === null) return res.json({ status: 'error', message: 'Invalid id specified' })
  if (ret.authCode !== inp.otp.toString()) return res.json({ status: 'error', message: 'Invalid OTP specified' })

  await Users.findByIdAndUpdate(inp.id, { authCode: '' })
  return res.json({ status: 'ok', message: ret._id })
})

/* SignupVerify web */
router.get('/signupverify/:id/:otp', async function(req, res, next) {
  var inp = req.body
  var id = req.params.id
  var otp = req.params.otp
  var ret

  ret = await Users.findOne({ _id: id }).exec()
  if (ret === null) return res.json({ status: 'error', message: 'Invalid id specified' })
  if (ret.authCode !== otp.toString()) return res.json({ status: 'error', message: 'Invalid OTP specified' })

  await Users.findByIdAndUpdate(id, { authCode: '' })
  return res.send('<h2> Thank you ' + ret.name + '</h2> <h3>Signup Successful. Please login from the App</h3>')
})

/* SignupVerify check */
router.post('/signupcheck', async function(req, res, next) {
  var inp = req.body
  var ret

  ret = await Users.findOne({ _id: inp.id }).exec()
  if (ret === null) return res.json({ status: 'error', message: 'Invalid id specified' })
  return res.json({ status: 'ok', value: ret.authCode.length })
})

/* Login */
router.post('/login', async function(req, res, next) {
  var inp = req.body
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
    await Users.findByIdAndUpdate(ret._id, { expoToken: inp.expoToken })
  }

  await Users.findByIdAndUpdate(ret._id, { lastSeen: new Date() })
  return res.json({
    status: 'ok',
    value: {
      id: ret._id,
      token: ret.token,
      name: ret.name,
      email: ret.email,
      mobile: ret.mobile,
      photo: ret.photo,
      role: ret.role
    }
  })
})

/* Google Signin */
router.post('/googlesignin', async function(req, res, next) {
  var inp = req.body
  console.log(inp)
  var ret
  ret = await Users.findOne({ email: inp.email }).exec()
  if (ret === null) {
    inp.role = inp.role ? inp.role : 'Passenger'
    var newuser = new Users(inp)
    ret = await newuser.save()
  } else {
    let upd = {}
    for (let key in inp) {
      if ((key === 'accessToken' || key === 'expoToken') && inp[key] !== ret[key]) upd[key] = inp[key]
      if (key === 'photo' && inp[key].length && !ret[key]) upd[key] = inp[key]
    }
    let out = await Users.findByIdAndUpdate(ret._id, upd).catch(console.log)
  }

  await Users.findByIdAndUpdate(ret._id, { lastSeen: new Date() })

  return res.json({
    status: 'ok',
    value: {
      id: ret._id,
      token: ret.token,
      accessToken: ret.accessToken,
      name: ret.name,
      email: ret.email,
      mobile: ret.mobile,
      photo: ret.photo,
      role: ret.role
    }
  })
})
module.exports = router
