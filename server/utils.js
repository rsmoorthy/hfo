var express = require('express')
var router = express.Router()
var axios = require('axios')
var rp = require('request-promise-native')
var Pickups = require('./models/Pickups')
var Users = require('./models/Users')
var R = require('ramda')
var crypto = require('crypto')

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
  }
  return resp
}

const promiseTo = async promise => {
  var err
  let data = await promise.catch(e => {
    err = e
  })
  return [err, data]
}

module.exports = {
  getLoginUser,
  promiseTo
}
