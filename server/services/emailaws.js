import { promiseTo } from '../utils'
var axios = require('axios')
var rp = require('request-promise')
var R = require('ramda')
var moment = require('moment')
var aws = require('aws-sdk')
var nodemailer = require('nodemailer')

var config = require('../config')['sesaws']
aws.config.update(config)

var transporter = nodemailer.createTransport({
  SES: new aws.SES(),
  sendingRate: 1
})

export const sendEmail = async email => {
  var params = {}
  params.from = email.from
  params.to = email.to
  params.subject = email.subject
  if (email.cc) params.cc = email.cc
  if (email.bcc) params.bcc = email.bcc
  if (email.text) params.text = email.text
  if (email.html) params.html = email.html
  if (email.attachments) params.attachments = email.attachments

  let err = null
  let ret = await transporter.sendMail(params).catch(e => {
    err = e
  })
  return [err, ret]
}

export const sendEmail2 = async email => {
  const ses = new aws.SES()
  aws.config.update(config)

  let [err, ret] = await promiseTo(
    ses
      .sendEmail({
        Destination: {
          ToAddresses: email.to
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: email.html
            },
            Text: {
              Charset: 'UTF-8',
              Data: email.text
            },
            Subject: {
              Charset: 'UTF-8',
              Data: email.subject
            }
          },
          Source: email.from,
          ReplyToAddresses: [email.from]
        }
      })
      .promise()
  )

  return [err, ret]
}
