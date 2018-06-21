import Expo from 'expo-server-sdk'
var Templates = require('../models/Templates')
var Users = require('../models/Users')
var utils = require('../utils')
var ejs = require('ejs')
var moment = require('moment')

const notificationSend = async (templName, row, userId) => {
  let err, msg, type
  msg = null

  switch (templName) {
    case 'WelcomePassenger':
    case 'NotifyReceiver':
      type = 'pickup'
      row.pickupDate = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      break

    case 'PassengerTripCompleted':
      type = 'pickup'
      row.pickupDate = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      row.completedDate = moment(row.completedDate).format('Do MMM YYYY HH:mm')
      break

    case 'ReceiverTripCompleted':
      type = 'pickup'
      row.pickupDate = moment(row.pickupDate).format('Do MMM YYYY HH:mm')
      row.completedDate = moment(row.completedDate).format('Do MMM YYYY HH:mm')
      break

    case 'Logout':
      type = 'logout'
      msg = { template: 'Forced Logout' }
      break

    default:
      return ['Invalid Notification Template name']
  }

  if (!msg) {
    msg = await Templates.findOne({ name: templName, type: 'Notification' })
      .exec()
      .catch(e => (err = e.message))
  }
  if (!msg) return ['Unable to send notification: ' + err]
  console.log('step 1', msg)

  let urow = await Users.findById(userId).exec()
  if (!urow || (urow && !urow.expoToken)) return [null, '']

  console.log('step 2', urow)
  let [err2, resp] = await sendNotification({
    token: urow.expoToken,
    body: ejs.render(msg.template, row),
    data: { body: ejs.render(msg.template, row), type: type, id: row._id }
  })

  console.log('step 3', err2, resp)
  return [err2, resp]
}

const sendNotification = async ({ token, body, data }) => {
  let expo = new Expo()
  let messages = []
  messages.push({ to: token, sound: 'default', body: body, data: data })

  const _sendNotification = async chunks => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    let err, receipts
    for (let chunk of chunks) {
      let receipts = await expo.sendPushNotificationsAsync(chunk).catch(e => (err = e.message))
      console.log('notification', err, receipts)
    }
    return [err, receipts]
  }

  let chunks = expo.chunkPushNotifications(messages)

  let [err, ret] = _sendNotification(chunks)
  return [err, ret]
}

module.exports = {
  notificationSend
}
