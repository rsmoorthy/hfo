import md5 from 'md5'
import axios from 'axios'
import qs from 'qs'
import config from '../config'

const hostip = config.SERVER_IP ? config.SERVER_IP : 'http://192.168.8.100:3000'
const host = hostip
console.log('host', host, process.env.SERVER_IP, process.env, config.SERVER_IP)

export const getCurrentFlights = () => {
  return (dispatch, getState) => {
    //  .get("http://139.59.30.14:3000/flights")
    const state = getState()
    axios({
      method: 'GET',
      url: host + '/flights',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      }
    })
      .then(response => {
        dispatch({ type: 'CURRENT_FLIGHTS', flights: response.data })
      })
      .catch(error => {
        // console.log('error.response', error.response)
        // console.log('error.request', error.request)
        console.log('error.message', error.message)
        // console.log('error.config', error.config)
      })
    // setTimeout(() => { dispatch( {type: "CURRENT_FLIGHTS", flights }) }, 3000)
  }
}

export const getUserList = role => {
  return (dispatch, getState) => {
    dispatch({ type: 'USER_LIST_IN_PROGRESS' })
    const state = getState()
    axios({
      method: 'GET',
      url: host + '/users' + (role ? '/role=' + role : ''),
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      }
    })
      .then(response => {
        if (response.data.status === 'ok') dispatch({ type: 'USER_LIST', users: response.data.users })
        else dispatch({ type: 'USER_LIST', users: [] })
      })
      .catch(error => {
        console.log('error.message', error.message)
      })
  }
}

export const doSignup = value => {
  return (dispatch, getState) => {
    dispatch({ type: 'SIGNUP_IN_PROGRESS', verify: false })

    axios
      .post(host + '/auth/signup', value)
      .then(response => {
        if (response.data.status === 'ok') dispatch({ type: 'SIGNUP_VERIFY', id: response.data.value.id })
        else dispatch({ type: 'SIGNUP_FAILURE', message: response.data.message, verify: false })
      })
      .catch(error => {
        dispatch({ type: 'SIGNUP_FAILURE', message: error.message, verify: false })
      })
  }
}

export const doSignupVerify = value => {
  return (dispatch, getState) => {
    dispatch({ type: 'SIGNUP_IN_PROGRESS', verify: true })

    axios
      .post(host + '/auth/signupverify', value)
      .then(response => {
        if (response.data.status === 'ok') dispatch({ type: 'SIGNUP_SUCCESS', verify: true })
        else dispatch({ type: 'SIGNUP_FAILURE', message: response.data.message, verify: true })
      })
      .catch(error => {
        dispatch({ type: 'SIGNUP_FAILURE', message: error.message, verify: true })
      })
  }
}

export const doLogin = value => {
  return (dispatch, getState) => {
    dispatch({ type: 'LOGIN_IN_PROGRESS' })
    let state = getState()
    value = { ...value }
    value.expoToken = state.hfo.expoToken

    axios
      .post(host + '/auth/login', value)
      .then(response => {
        if (response.data.status === 'ok') dispatch({ type: 'LOGIN_SUCCESS', value: response.data.value })
        else dispatch({ type: 'LOGIN_FAILURE', message: response.data.message })
      })
      .catch(error => {
        dispatch({ type: 'LOGIN_FAILURE', message: error.message })
      })
  }
}

export const doGoogleSignin = value => {
  return (dispatch, getState) => {
    dispatch({ type: 'LOGIN_IN_PROGRESS' })
    let state = getState()
    value = { ...value }
    value.expoToken = state.hfo.expoToken

    axios
      .post(host + '/auth/googlesignin', value)
      .then(response => {
        if (response.data.status === 'ok') dispatch({ type: 'LOGIN_SUCCESS', value: response.data.value })
        else dispatch({ type: 'LOGIN_FAILURE', message: response.data.message })
      })
      .catch(error => {
        dispatch({ type: 'LOGIN_FAILURE', message: error.message })
      })
  }
}

export const doLogout = () => ({
  type: 'LOGOUT'
})

export const resetSignup = () => ({
  type: 'SIGNUP_RESET'
})

export const signupCheck = id => {
  return (dispatch, getState) => {
    axios
      .post(host + '/auth/signupcheck', { id: id })
      .then(response => {
        if (response.data.status === 'ok' && response.data.value === 0)
          dispatch({ type: 'SIGNUP_SUCCESS', verify: true })
      })
      .catch()
  }
}

export const doUpdateUser = value => {
  return (dispatch, getState) => {
    const state = getState()
    dispatch({ type: 'UPDATE_USER_RESET' })
    axios({
      method: 'POST',
      url: host + '/users/update/' + value._id,
      data: value,
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      }
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'UPDATE_USER_SUCCESS', user: value })
          setTimeout(() => dispatch({ type: 'UPDATE_USER_RESET' }), 8000)
          getUserList()(dispatch, getState)
        } else dispatch({ type: 'UPDATE_USER_FAILURE', message: response.data.message })
      })
      .catch(error => {
        dispatch({ type: 'UPDATE_USER_FAILURE', message: error.message })
      })
  }
}

export const doUpdateLoginData = value => {
  return (dispatch, getState) => {
    const state = getState()
    axios({
      method: 'POST',
      url: host + '/users/update/' + value.id,
      data: value,
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      }
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'UPDATE_LOGIN_DATA', data: value })
        }
      })
      .catch()
  }
}

export const getPickups = (id, callback) => {
  return (dispatch, getState) => {
    dispatch({ type: 'PICKUP_LIST_IN_PROGRESS' })
    const state = getState()
    axios({
      method: 'GET',
      url: host + '/pickups' + (id === undefined ? '' : '/' + id),
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      }
    })
      .then(response => {
        if (response.data.status === 'ok' && id) {
          dispatch({ type: 'PICKUP_LIST', pickup: response.data.pickup, id: id })
          if (callback) callback(response.data.pickup)
        } else if (response.data.status === 'ok') {
          dispatch({ type: 'PICKUP_LIST', pickups: response.data.pickups })
          if (callback) callback(response.data.pickups)
        } else dispatch({ type: 'PICKUP_LIST', pickups: [], id: id })
      })
      .catch(error => {
        console.log('error.message', error.message)
      })
  }
}

export const doAddPickup = value => {
  return (dispatch, getState) => {
    const state = getState()
    dispatch({ type: 'PICKUP_RESET' })
    const options = {}
    const val = { ...value }
    delete val.callback
    // .post(host + '/pickups', { ...value, agentIdId: state.hfo.login.id })
    axios({
      method: 'POST',
      url: host + '/pickups',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      },
      data: { ...val, agentIdId: state.hfo.login.id }
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'PICKUP_SUCCESS', user: value })
          setTimeout(() => dispatch({ type: 'PICKUP_RESET' }), 8000)
          getPickups()(dispatch, getState)
          if (value.callback) value.callback(null, response.data.message)
        } else {
          if (value.callback) value.callback(response.data.message)
          dispatch({ type: 'PICKUP_FAILURE', message: response.data.message })
        }
      })
      .catch(error => {
        if (value.callback) value.callback(error.message)
        dispatch({ type: 'PICKUP_FAILURE', message: error.message })
      })
  }
}

export const doUpdatePickup = (value, callback) => {
  return (dispatch, getState) => {
    const state = getState()
    dispatch({ type: 'PICKUP_RESET' })
    const options = {}
    // .post(host + '/pickups', { ...value, agentIdId: state.hfo.login.id })
    axios({
      method: 'PUT',
      url: host + '/pickups/' + value._id,
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      },
      data: value
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'PICKUP_SUCCESS', user: value })
          setTimeout(() => dispatch({ type: 'PICKUP_RESET' }), 8000)
          getPickups()(dispatch, getState)
          if (callback) callback(null, response.data.message)
        } else {
          if (callback) value.callback(response.data.message)
          dispatch({ type: 'PICKUP_FAILURE', message: response.data.message })
        }
      })
      .catch(error => {
        if (callback) callback(error.message)
        dispatch({ type: 'PICKUP_FAILURE', message: error.message })
      })
  }
}

export const doCompletePickup = value => {
  return (dispatch, getState) => {
    console.log('complete pickup', value)
    const state = getState()
    dispatch({ type: 'PICKUP_COMPLETE_RESET' })
    const options = {}
    // .post(host + '/pickups', { ...value, agentIdId: state.hfo.login.id })
    axios({
      method: 'PUT',
      url: host + '/pickups/complete/' + value._id,
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      },
      data: value
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'PICKUP_COMPLETE_SUCCESS', user: value })
          setTimeout(() => dispatch({ type: 'PICKUP_COMPLETE_RESET' }), 8000)
          getPickups()(dispatch, getState)
        } else dispatch({ type: 'PICKUP_COMPLETE_FAILURE', message: response.data.message })
      })
      .catch(error => {
        dispatch({ type: 'PICKUP_COMPLETE_FAILURE', message: error.message })
      })
  }
}

export const doReceiveNotification = notification => ({
  type: 'NOTIFICATION',
  notification: notification
})

export const setExpoToken = expoToken => ({
  type: 'EXPO_TOKEN',
  expoToken
})

export const setOpacity = opacity => ({
  type: 'OPACITY',
  opacity
})

export const getTemplates = callback => {
  return (dispatch, getState) => {
    dispatch({ type: 'ADMIN_IN_PROGRESS' })
    const state = getState()
    axios({
      method: 'GET',
      url: host + '/templates',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      }
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'TEMPLATES_LIST', templates: response.data.templates })
          if (callback) callback(null, response.data.message)
        } else dispatch({ type: 'TEMPLATES_LIST', templates: [] })
      })
      .catch(error => {
        dispatch({ type: 'TEMPLATES_LIST', templates: [] })
        if (callback) callback(error)
      })
  }
}

export const doAddTemplate = (value, callback) => {
  return (dispatch, getState) => {
    dispatch({ type: 'ADMIN_IN_PROGRESS' })
    const state = getState()
    axios({
      method: 'POST',
      url: host + '/templates',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      },
      data: value
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'TEMPLATES_LIST' })
          if (callback) callback(null, response.data.message)
          getTemplates()(dispatch, getState)
        } else dispatch({ type: 'TEMPLATES_LIST' })
      })
      .catch(error => {
        dispatch({ type: 'TEMPLATES_LIST' })
        if (callback) callback(error)
      })
  }
}

export const doUpdateTemplate = (value, callback) => {
  return (dispatch, getState) => {
    dispatch({ type: 'ADMIN_IN_PROGRESS' })
    const state = getState()
    axios({
      method: 'PUT',
      url: host + '/templates/update/' + value._id,
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      },
      data: value
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'TEMPLATES_LIST' })
          if (callback) callback(null, response.data.message)
          getTemplates()(dispatch, getState)
        } else dispatch({ type: 'TEMPLATES_LIST' })
      })
      .catch(error => {
        dispatch({ type: 'TEMPLATES_LIST' })
        if (callback) callback(error)
      })
  }
}

// Remove the rest of it
export const doIncrement = () => ({
  type: 'INCREMENT'
})

export const doSet = ev => ({
  type: 'SET',
  value: ev.target.value
})

export const txtSet = ev => ({
  type: 'TXTSET',
  value: ev.target.value
})

export const dummy = () => ({
  type: 'DUMMY'
})

export const goBack = history => ({
  type: 'GO_BACK',
  history
})

export const getDummyData = id => {
  return (dispatch, getState) => {
    setTimeout(() => {
      dispatch({
        type: 'DUMMY_DATA',
        id,
        value: id + ' ' + new Date().toString()
      })
    }, 3000)
  }
}
