import { sendSMS } from './smscountry'
var Templates = require('../models/Templates')
var Users = require('../models/Users')
var Pickups = require('../models/Pickups')
var utils = require('../utils')
var ejs = require('ejs')

const smsSend = async (templName, row) => {
  if (!row.mobile) return [null, '']
  let err, msg

  msg = await Templates.findOne({ name: templName })
    .exec()
    .catch(e => (err = e.message))
  if (!msg) return ['Unable to send SMS: ' + err]

  switch (templName) {
    case 'OTP': {
      let r = row._doc ? row._doc : row
      if (!r.otp) r.otp = r.authCode
      let [err, resp] = await sendSMS({ mobile: r.mobile, message: ejs.render(msg.template, r) })
      return [err, resp]
    }

    case 'WelcomePassenger':
    case 'NotifyReceiver': {
      let [err, resp] = await sendSMS({ mobile: row.mobile, message: ejs.render(msg.template, row) })
      return [err, resp]
    }
  }
}

module.exports = {
  smsSend
}
