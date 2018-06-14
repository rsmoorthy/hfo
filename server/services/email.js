var Templates = require('../models/Templates')
var Users = require('../models/Users')
var Pickups = require('../models/Pickups')
var utils = require('../utils')
var ejs = require('ejs')
var path = require('path')
var emailaws = require('../services/emailaws')

const emailSend = async (templName, row) => {
  if (!row.email) return [null, '']

  let file
  switch (templName) {
    case 'OTP':
      file = path.join(__dirname, '../templates/email_newaccount.ejs')
      if (!row.otp) row.otp = row.authCode
      break
    case 'WelcomePassenger':
      file = path.join(__dirname, '../templates/email_welcomepassenger.ejs')
      break
    case 'NotifyReceiver':
      file = path.join(__dirname, '../templates/email_notifypassenger.ejs')
      break
  }

  let err
  let html = await ejs.renderFile(file, row).catch(e => (err = e.message))
  if (err) return [err]

  {
    let [err, out] = await emailaws.sendEmail({
      from: 'support@hfoinc.in',
      to: row.email,
      subject: 'Please verify your HFO account ',
      html: html
    })
    return [err, out]
  }
}

module.exports = {
  emailSend
}
