import md5 from 'md5'
import axios from 'axios'
import qs from 'qs'

const hostip = process.env.SERVER_IP ? process.env.SERVER_IP : '192.168.8.100'
const host = 'http://' + hostip + ':3000'
console.log('host', host, process.env.SERVER_IP, process.env)

export const getCurrentFlights = () => {
  return (dispatch, getState) => {
    //  .get("http://139.59.30.14:3000/flights")
    axios
      .get(host + '/flights')
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

export const getUserList = () => {
  return (dispatch, getState) => {
    axios
      .get(host + '/users')
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
    console.log('doLogin', state.hfo.expoToken, value)

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
  type: 'RESET_SIGNUP'
})

export const doUpdateUser = value => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_USER_RESET' })
    axios
      .post(host + '/users/update/' + value._id, value)
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

export const getPickups = () => {
  return (dispatch, getState) => {
    const state = getState()
    axios({
      method: 'GET',
      url: host + '/pickups',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      }
    })
      .then(response => {
        if (response.data.status === 'ok') dispatch({ type: 'PICKUP_LIST', pickups: response.data.pickups })
        else dispatch({ type: 'PICKUP_LIST', pickups: [] })
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
    // .post(host + '/pickups', { ...value, bookingAgentId: state.hfo.login.id })
    axios({
      method: 'POST',
      url: host + '/pickups',
      headers: {
        Authorization: 'token ' + state.hfo.login.token
      },
      data: { ...value, bookingAgentId: state.hfo.login.id }
    })
      .then(response => {
        if (response.data.status === 'ok') {
          dispatch({ type: 'PICKUP_SUCCESS', user: value })
          setTimeout(() => dispatch({ type: 'PICKUP_RESET' }), 8000)
          getPickups()(dispatch, getState)
        } else dispatch({ type: 'PICKUP_FAILURE', message: response.data.message })
      })
      .catch(error => {
        dispatch({ type: 'PICKUP_FAILURE', message: error.message })
      })
  }
}

export const doUpdatePickup = value => {
  return (dispatch, getState) => {
    console.log('update pickup', value)
    const state = getState()
    dispatch({ type: 'PICKUP_RESET' })
    const options = {}
    // .post(host + '/pickups', { ...value, bookingAgentId: state.hfo.login.id })
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
        } else dispatch({ type: 'PICKUP_FAILURE', message: response.data.message })
      })
      .catch(error => {
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
    // .post(host + '/pickups', { ...value, bookingAgentId: state.hfo.login.id })
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
