import R from 'ramda'
const initialState = {
  currentFlights: [],
  users: [],
  passengers: {},
  receivers: {},
  pickups: [],
  notifications: [],
  signup: {
    inProgress: false,
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
    error: ''
  },
  meta: {
    inProgress: false,
    updateUserError: '',
    updateUserSuccess: '',
    pickupError: '',
    pickupSuccess: ''
  },
  text: '',
  apps: [],
  dummyData: {}
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
        receivers: getUserListByRole('Receiver', action.users)
      }

    case 'SIGNUP_IN_PROGRESS':
      return {
        ...state,
        signup: {
          inProgress: true,
          successMessage: '',
          errorMessage: ''
        }
      }

    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        signup: {
          inProgress: false,
          successMessage: 'Signup Successful!',
          errorMessage: ''
        }
      }

    case 'SIGNUP_FAILURE':
      return {
        ...state,
        signup: {
          inProgress: false,
          successMessage: '',
          errorMessage: action.message
        }
      }

    case 'RESET_SIGNUP':
      return {
        ...state,
        signup: {
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
          error: action.type === 'LOGIN_FAILURE' ? action.message : ''
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
        pickups: action.pickups
      }

    case 'PICKUP_SUCCESS':
    case 'PICKUP_FAILURE':
    case 'PICKUP_RESET':
      return {
        ...state,
        meta: {
          ...state.meta,
          pickupSuccess: action.type === 'PICKUP_SUCCESS' ? 'Updated Successfully' : '',
          pickupError: action.type === 'PICKUP_FAILURE' ? action.message : ''
        }
      }

    case 'NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.notification]
      }

    case 'EXPO_TOKEN':
      return {
        ...state,
        expoToken: action.expoToken
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
