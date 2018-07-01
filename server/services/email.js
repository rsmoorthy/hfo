var Templates = require('../models/Templates')
var Users = require('../models/Users')
var Pickups = require('../models/Pickups')
var utils = require('../utils')
var ejs = require('ejs')
var path = require('path')
var emailaws = require('../services/emailaws')
var moment = require('moment')

const emailSend = async (templName, row) => {
  let file, subject
  switch (templName) {
    case 'OTP':
      file = path.join(__dirname, '../templates/email_newaccount.ejs')
      subject = 'Please verify your HFO account'
      if (!row.otp) row.otp = row.authCode
      break
    case 'WelcomePassenger':
      file = path.join(__dirname, '../templates/email_welcomepassenger.ejs')
      subject = 'Your HFO pickup details'
      // row.pickupDateFormat = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      break

    case 'NotifyReceiver':
      file = path.join(__dirname, '../templates/email_notifyreceiver.ejs')
      subject = 'Pickup details for you'
      // row.pickupDateFormat = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      row.email = row.receiver.email
      break

    case 'PassengerTripCompleted':
      file = path.join(__dirname, '../templates/email_completedpassenger.ejs')
      subject = 'Your HFO pickup completed'
      // row.pickupDateFormat = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      // row.completedDateFormat = moment(row.completedDate).format('Do MMM YYYY HH:mm')
      break

    case 'ReceiverTripCompleted':
      file = path.join(__dirname, '../templates/email_completedreceiver.ejs')
      subject = 'You completed HFO pickup'
      // row.pickupDateFormat = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      // row.completedDateFormat = moment(row.completedDate).format('Do MMM YYYY HH:mm')
      row.email = row.receiver.email
      break

    case 'ResetPassword':
      file = path.join(__dirname, '../templates/email_resetpassword.ejs')
      subject = 'Your password has been reset'
      break

    default:
      return ['Invalid Email Template name']
  }

  if (!row.email) return [null, '']

  let err
  let html = await ejs.renderFile(file, row).catch(e => (err = e.message))
  if (err) return [err]

  {
    let [err, out] = await emailaws.sendEmail({
      from: 'support@hfoinc.in',
      to: row.email,
      subject: subject,
      html: html
    })
    return [err, out]
  }
}

module.exports = {
  emailSend
}
