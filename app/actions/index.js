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
        console.log('error.message', error.message)
      })
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

export const doGoogleSignin = (value, callback) => {
  return (dispatch, getState) => {
    dispatch({ type: 'LOGIN_IN_PROGRESS' })
    let state = getState()
    value = { ...value }
    value.expoToken = state.hfo.expoToken

    axios
      .post(host + '/auth/googlesignin', value)
      .then(response => {
        if (response.data.status === 'ok') {
          if (response.data.signup === false) dispatch({ type: 'LOGIN_SUCCESS', value: response.data.value })
          if (callback) callback(null, response.data)
        } else {
          if (callback) callback(response.data.message)
          dispatch({ type: 'LOGIN_FAILURE', message: response.data.message })
        }
      })
      .catch(error => {
        if (callback) callback(error.message)
        dispatch({ type: 'LOGIN_FAILURE', message: error.message })
      })
  }
}

export const doGoogleSigninComplete = (value, callback) => {
  return (dispatch, getState) => {
    dispatch({ type: 'LOGIN_IN_PROGRESS' })
    value = { ...value }

    axios
      .post(host + '/auth/googlesignin/complete', value)
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'LOGIN_SUCCESS', value: response.data.value })
          if (callback) callback(null, response.data)
        } else {
          if (callback) callback(response.data.message)
          dispatch({ type: 'LOGIN_FAILURE', message: response.data.message })
        }
      })
      .catch(error => {
        if (callback) callback(error.message)
        dispatch({ type: 'LOGIN_FAILURE', message: error.message })
      })
  }
}

export const doLogout = () => {
  return (dispatch, getState) => {
    let state = getState()
    var id = state.hfo.login.id
    var expoToken = state.hfo.login.expoToken
    dispatch({ type: 'LOGOUT' })
    axios
      .post(host + '/auth/logout', { id, expoToken })
      .then(response => {})
      .catch(error => {
        console.log(error.message)
      })
  }
}

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
          console.log('do update login data', response.data.user.photo, state.hfo.login.photo)
          dispatch({ type: 'UPDATE_LOGIN_DATA', data: response.data.user })
        }
      })
      .catch(console.log)
  }
}

export const getPickups = (scope, id, callback) => {
  return (dispatch, getState) => {
    dispatch({ type: 'PICKUP_LIST_IN_PROGRESS' })
    const state = getState()
    axios({
      method: 'GET',
      url: host + '/pickups/' + (scope || 'current') + (id === undefined ? '' : '/' + id),
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

export const doAddPickup = (value, callback) => {
  return (dispatch, getState) => {
    const state = getState()
    dispatch({ type: 'PICKUP_RESET' })
    const options = {}
    // .post(host + '/pickups', { ...value, agentIdId: state.hfo.login.id })
    axios({
      method: 'POST',
      url: host + '/pickups',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      },
      data: { ...value, agentId: state.hfo.login.id }
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'PICKUP_SUCCESS', pickup: value })
          setTimeout(() => dispatch({ type: 'PICKUP_RESET' }), 8000)
          getPickups('id', response.data.id)(dispatch, getState)
          if (callback) callback(null, response.data.message)
        } else {
          if (callback) callback(response.data.message)
          dispatch({ type: 'PICKUP_FAILURE', message: response.data.message })
        }
      })
      .catch(error => {
        if (callback) callback(error.message)
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
          getPickups('id', value._id)(dispatch, getState)
          if (callback) callback(null, response.data.message)
        } else {
          if (callback) callback(response.data.message)
          dispatch({ type: 'PICKUP_FAILURE', message: response.data.message })
        }
      })
      .catch(error => {
        if (callback) callback(error.message)
        dispatch({ type: 'PICKUP_FAILURE', message: error.message })
      })
  }
}

export const doCompletePickup = (value, callback) => {
  return (dispatch, getState) => {
    console.log('complete pickup', value)
    const state = getState()
    dispatch({ type: 'PICKUP_COMPLETE_RESET' })
    const options = {}
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
          getPickups('id', value._id)(dispatch, getState)
          if (callback) callback(null, response.data.message)
        } else {
          if (callback) callback(response.data.message)
          dispatch({ type: 'PICKUP_COMPLETE_FAILURE', message: response.data.message })
        }
      })
      .catch(error => {
        if (callback) callback(error.message)
        dispatch({ type: 'PICKUP_COMPLETE_FAILURE', message: error.message })
      })
  }
}

export const doReceiveNotification = (notification, onlyId) => ({
  type: 'NOTIFICATION',
  notification: notification,
  onlyId: onlyId
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

export const getServerConfig = callback => {
  return (dispatch, getState) => {
    dispatch({ type: 'ADMIN_IN_PROGRESS' })
    const state = getState()
    axios({
      method: 'GET',
      url: host + '/config',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      }
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'ADMIN_CONFIG', config: response.data.config })
          if (callback) callback(null, response.data.message)
        } else dispatch({ type: 'ADMIN_CONFIG', config: {} })
      })
      .catch(error => {
        dispatch({ type: 'ADMIN_CONFIG', config: {} })
        if (callback) callback(error)
      })
  }
}

export const doUpdateServerConfig = (value, callback) => {
  return (dispatch, getState) => {
    dispatch({ type: 'ADMIN_IN_PROGRESS' })
    const state = getState()
    axios({
      method: 'PUT',
      url: host + '/config',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      },
      data: value
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'ADMIN_CONFIG', config: response.data.config })
          if (callback) callback(null, response.data.message)
        } else dispatch({ type: 'ADMIN_CONFIG' })
      })
      .catch(error => {
        dispatch({ type: 'ADMIN_CONFIG' })
        if (callback) callback(error)
      })
  }
}

export const doResetPassword = (value, callback) => {
  return (dispatch, getState) => {
    axios({
      method: 'POST',
      url: host + '/auth/resetpassword',
      data: value
    })
      .then(response => {
        if (response.data.status === 'ok') {
          if (callback) callback(null, response.data.message)
        } else if (callback) callback(response.data.message)
      })
      .catch(error => {
        console.log(error.message)
        if (callback) callback(error.message)
      })
  }
}

export const doChangePassword = (value, callback) => {
  return (dispatch, getState) => {
    const state = getState()
    axios({
      method: 'POST',
      url: host + '/auth/changepassword',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      },
      data: { ...value, _id: state.hfo.login.id }
    })
      .then(response => {
        if (response.data.status === 'ok') {
          if (callback) callback(null, response.data.message)
        } else if (callback) callback(response.data.message)
      })
      .catch(error => {
        if (callback) callback(error.message)
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
