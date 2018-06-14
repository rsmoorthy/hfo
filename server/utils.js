var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var Pickups = require('./models/Pickups')
var Users = require('./models/Users')
var R = require('ramda')
var crypto = require('crypto')
var config = require('./config')['global']

const getLoginUser = async req => {
  if (!('authorization' in req.headers)) return {}
  var m = req.headers['authorization'].match(/^token (.*)/)
  if (m === null) return {}
  var resp = { id: m[1] }
  var ret
  ret = await Users.findById(resp.id).exec()
  if (ret) {
    resp.name = ret.name
    resp.mobile = ret.mobile
    resp.email = ret.email
    resp.role = ret.role
    resp.photo = getPhotoUrl(ret._id, ret.photo)
    await Users.findByIdAndUpdate(resp.id, { lastSeen: new Date() })
  }
  return resp
}

// the mobile number or email id should not be repeated or reused
const checkDuplicateUserRecord = async row => {
  const compare = field => {
    return rec =>
      row[field].toString() === rec[field].toString()
        ? row._id
          ? row._id.toString() !== rec._id.toString()
          : true
        : false
  }
  if (row.mobile) {
    let ret2 = await Users.find({ mobile: row.mobile })
    ret2 = R.filter(compare('mobile'), ret2 === null ? [] : ret2)
    if (ret2.length) return ['Mobile number ' + row.mobile + ' already exist']
  }
  if (row.email) {
    let ret2 = await Users.find({ email: row.email })
    ret2 = R.filter(compare('email'), ret2 === null ? [] : ret2)
    if (ret2.length) return ['Email ' + row.email + ' already exist']
  }
  return null
}

const promiseTo = async promise => {
  var err
  let data = await promise.catch(e => {
    err = e
  })
  return [err, data]
}

const getPhotoUrl = (id, photo) => {
  if (photo && photo.length && photo.substr(0, 4) === 'data') return config.SERVER_IP + '/users/photo/' + id
  return photo === undefined ? '' : photo
}

module.exports = {
  getLoginUser,
  checkDuplicateUserRecord,
  promiseTo,
  getPhotoUrl
}
