import R from 'ramda'
const initialState = {
  currentFlights: [],
  users: [],
  passengers: {},
  receivers: {},
  pickups: [],
  notifications: [],
  smsTemplates: [],
  emailTemplates: [],
  notificationTemplates: [],
  signup: {
    id: '',
    inProgress: false,
    needAuthCode: false,
    successMessage: '',
    errorMessage: ''
  },
  expoToken: '',
  login: {
    inProgress: false,
    token: '',
    id: '',
    name: '',
    email: '',
    mobile: '',
    role: '',
    error: '',
    photo: '',
    rating: null,
    lastSeen: null,
    pickups: 0
  },
  meta: {
    lastNotificationId: null,
    screenOpacity: 1,
    adminInProgress: false,
    userListInProgress: false,
    pickupListInProgress: false,
    inProgress: false,
    updateUserError: '',
    updateUserSuccess: '',
    pickupError: '',
    pickupSuccess: '',
    pickupCompleteError: '',
    pickupCompleteSuccess: ''
  },
  text: '',
  apps: [],
  dummyData: {}
}

const updateRecordById = (records, row, id) => {
  let idx = records.findIndex(obj => obj[id] === row[id])
  if (idx >= 0) {
    return [...records.slice(0, idx), row, ...records.slice(idx + 1)]
  } else {
    return [...records, row]
  }
}

const getUserListByRole = (role = 'Passenger', users) => {
  return R.pipe(
    R.filter(user => user.role === role),
    R.reduce((acc, user) => {
      acc[user._id] = user.name
      return acc
    }, {})
  )(users)
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'OPACITY':
      return {
        ...state,
        meta: {
          ...state.meta,
          screenOpacity: action.opacity
        }
      }

    case 'CURRENT_FLIGHTS':
      return {
        ...state,
        currentFlights: action.flights
      }

    case 'USER_LIST':
      return {
        ...state,
        users: action.users,
        passengers: getUserListByRole('Passenger', action.users),
        receivers: getUserListByRole('Receiver', action.users),
        meta: {
          ...state.meta,
          userListInProgress: false
        }
      }

    case 'USER_LIST_IN_PROGRESS':
      return {
        ...state,
        meta: {
          ...state.meta,
          userListInProgress: true
        }
      }

    case 'SIGNUP_IN_PROGRESS':
      return {
        ...state,
        signup: {
          ...state.signup,
          inProgress: true,
          successMessage: '',
          errorMessage: ''
        }
      }

    case 'SIGNUP_VERIFY':
      return {
        ...state,
        signup: {
          id: action.id,
          needAuthCode: true,
          inProgress: false,
          successMessage: '',
          errorMessage: ''
        }
      }

    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        signup: {
          id: '',
          needAuthCode: false,
          inProgress: false,
          successMessage: 'Signup Successful!',
          errorMessage: ''
        }
      }

    case 'SIGNUP_FAILURE':
      return {
        ...state,
        signup: {
          id: action.verify ? state.signup.id : '',
          needAuthCode: action.verify === true,
          inProgress: false,
          successMessage: '',
          errorMessage: action.message
        }
      }

    case 'SIGNUP_RESET':
      return {
        ...state,
        signup: {
          id: '',
          needAuthCode: false,
          inProgress: false,
          successMessage: '',
          errorMessage: ''
        }
      }

    case 'LOGIN_IN_PROGRESS':
      return {
        ...state,
        login: {
          ...state.login,
          inProgress: true,
          error: ''
        }
      }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        login: {
          inProgress: false,
          token: action.value.token ? action.value.token : action.value.id,
          id: action.value.id,
          name: action.value.name,
          email: action.value.email,
          mobile: action.value.mobile,
          role: action.value.role,
          photo: action.value.photo,
          rating: action.value.rating,
          pickups: action.value.pickups,
          lastSeen: action.value.lastSeen,
          error: ''
        }
      }

    case 'LOGIN_FAILURE':
    case 'LOGOUT':
      return {
        ...state,
        login: {
          inProgress: false,
          token: '',
          id: '',
          name: '',
          email: '',
          mobile: '',
          role: '',
          photo: '',
          error: action.type === 'LOGIN_FAILURE' ? action.message : ''
        },
        users: [],
        passengers: {},
        receivers: {},
        pickups: []
      }

    case 'UPDATE_LOGIN_DATA':
      return {
        ...state,
        login: {
          ...state.login,
          photo: action.data.photo
        }
      }

    case 'UPDATE_USER_SUCCESS':
    case 'UPDATE_USER_FAILURE':
    case 'UPDATE_USER_RESET':
      return {
        ...state,
        meta: {
          ...state.meta,
          updateUserSuccess: action.type === 'UPDATE_USER_SUCCESS' ? 'Updated Successfully' : '',
          updateUserError: action.type === 'UPDATE_USER_FAILURE' ? action.message : ''
        }
      }

    case 'PICKUP_LIST':
      return {
        ...state,
        pickups: action.id ? updateRecordById(state.pickups, action.pickup, '_id') : action.pickups,
        meta: {
          ...state.meta,
          pickupListInProgress: false
        }
      }

    case 'PICKUP_LIST_IN_PROGRESS':
      return {
        ...state,
        meta: {
          ...state.meta,
          pickupListInProgress: true
        }
      }

    case 'PICKUP_SUCCESS':
    case 'PICKUP_FAILURE':
    case 'PICKUP_RESET':
      return {
        ...state,
        meta: {
          ...state.meta,
          pickupListInProgress: false,
          pickupSuccess: action.type === 'PICKUP_SUCCESS' ? 'Updated Successfully' : '',
          pickupError: action.type === 'PICKUP_FAILURE' ? action.message : ''
        }
      }

    case 'PICKUP_COMPLETE_SUCCESS':
    case 'PICKUP_COMPLETE_FAILURE':
    case 'PICKUP_COMPLETE_RESET':
      return {
        ...state,
        meta: {
          ...state.meta,
          pickupCompleteSuccess: action.type === 'PICKUP_COMPLETE_SUCCESS' ? 'Updated Successfully' : '',
          pickupCompleteError: action.type === 'PICKUP_COMPLETE_FAILURE' ? action.message : ''
        }
      }

    case 'NOTIFICATION':
      return {
        ...state,
        notifications: action.onlyId
          ? state.notifications
          : updateRecordById(state.notifications, action.notification, 'notificationId'),
        meta: {
          ...state.meta,
          lastNotificationId: action.notification.notificationId
        }
      }

    case 'EXPO_TOKEN':
      return {
        ...state,
        expoToken: action.expoToken
      }

    case 'ADMIN_IN_PROGRESS':
      return {
        ...state,
        meta: {
          ...state.meta,
          adminInProgress: true
        }
      }

    case 'TEMPLATES_LIST':
      return {
        ...state,
        smsTemplates: action.templates ? R.filter(item => item.type === 'SMS', action.templates) : state.smsTemplates,
        emailTemplates: action.templates
          ? R.filter(item => item.type === 'Email', action.templates)
          : state.emailTemplates,
        notificationTemplates: action.templates
          ? R.filter(item => item.type === 'Notification', action.templates)
          : state.notificationTemplates,
        meta: {
          ...state.meta,
          adminInProgress: false
        }
      }

    // ------------------------------------------------------------------

    case 'SET':
      let val = parseInt(action.value, 10)
      if (isNaN(val)) return state
      return {
        ...state,
        counter: val
      }

    case 'TXTSET':
      return {
        ...state,
        text: action.value
      }

    case 'GO_BACK':
      // typeof action.history === "object" && action.history.goBack()
      return {
        ...state,
        apps: state.apps.length ? state.apps.slice(1) : state.apps
      }

    case 'DUMMY_DATA':
      const id = action.id
      return {
        ...state,
        dummyData: { ...state.dummyData, [id]: action.value }
      }

    default:
      return state
  }
}
