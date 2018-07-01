import { sendSMS } from './smsmsg91'
var Templates = require('../models/Templates')
var Users = require('../models/Users')
var Pickups = require('../models/Pickups')
var utils = require('../utils')
var ejs = require('ejs')
var moment = require('moment')

const smsSend = async (templName, row) => {
  let err, msg

  msg = await Templates.findOne({ name: templName, type: 'SMS' })
    .exec()
    .catch(e => (err = e.message))
  if (!msg) return ['Unable to send SMS: ' + err]

  switch (templName) {
    case 'OTP': {
      if (!row.mobile) return [null, '']
      if (!row.otp) row.otp = row.authCode
      let [err, resp] = await sendSMS({ mobile: row.mobile, message: ejs.render(msg.template, row) })
      return [err, resp]
    }

    case 'WelcomePassenger': {
      if (!row.mobile) return [null, '']
      // row.pickupDateFormat = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      let [err, resp] = await sendSMS({ mobile: row.mobile, message: ejs.render(msg.template, row) })
      return [err, resp]
    }

    case 'NotifyReceiver': {
      if (!row.receiver.mobile) return [null, '']
      // row.pickupDateFormat = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      let [err, resp] = await sendSMS({ mobile: row.receiver.mobile, message: ejs.render(msg.template, row) })
      return [err, resp]
    }

    case 'PassengerTripCompleted': {
      if (!row.mobile) return [null, '']
      // row.pickupDateFormat = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      // row.completedDateFormat = moment(row.completedDate).format('Do MMM YYYY HH:mm')
      let [err, resp] = await sendSMS({ mobile: row.mobile, message: ejs.render(msg.template, row) })
      return [err, resp]
    }

    case 'ReceiverTripCompleted': {
      if (!row.receiver.mobile) return [null, '']
      // row.pickupDateFormat = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      // row.completedDateFormat = moment(row.completedDate).format('Do MMM YYYY HH:mm')
      let [err, resp] = await sendSMS({ mobile: row.receiver.mobile, message: ejs.render(msg.template, row) })
      return [err, resp]
    }

    case 'ResetPassword': {
      let [err, resp] = await sendSMS({ mobile: row.mobile, message: ejs.render(msg.template, row) })
      return [err, resp]
    }

    default:
      return ['Invalid SMS Template name']
  }
}

module.exports = {
  smsSend
}
