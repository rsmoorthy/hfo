var axios = require('axios')
var rp = require('request-promise-native')
var R = require('ramda')
var moment = require('moment')
var Transactions = require('../models/Transactions')
var config = require('../config')['smscountry']

export const sendSMS = async sms => {
  var mobile = sms.mobile.toString()
  mobile = mobile.replace(/\s+/, '')
  if (mobile.length === 10) mobile = '91' + mobile
  else if (mobile.length === 13 && mobile.substr(0, 3) === '+91') mobile = mobile.substr(1)

  let err, tr, ret
  var resp = await rp
    .get({
      uri: 'http://api.smscountry.com/SMSCwebservice_bulk.aspx',
      qs: {
        User: config.User,
        passwd: config.passwd,
        mobilenumber: mobile,
        message: sms.message,
        sid: config.sid,
        mtype: 'N',
        DR: 'Y'
      }
    })
    .catch(e => (err = e.message))

  if (err)
    tr = new Transactions({ mode: 'SMS', type: 'Error', recordId: sms._id, subject: sms.message, descripion: err })
  else
    tr = new Transactions({ mode: 'SMS', type: 'Success', recordId: sms._id, subject: sms.message, descripion: resp })

  ret = await tr.save()
  return [err, resp]
}
