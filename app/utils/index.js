import * as R from 'ramda'
import { bindActionCreators } from 'redux'
import * as actionCreators from '../actions'
import t from 'tcomb-form-native' // 0.6.9
import moment from 'moment'

export const mapStateToProps = R.curry((base, keys, state) => {
  var r = R.pick(keys, state[base])
  return r
})
export const mapDispatchToProps = dispatch => {
  let actions = bindActionCreators(actionCreators, dispatch)
  return { ...actions, dispatch }
}

export const lastSeen = tm => {
  let diff
  let now = moment()
  let mtm = moment(tm)
  diff = now.diff(mtm, 'seconds')
  if (diff < 0 || diff === 0) return 'now'
  if (diff < 60) return diff.toString() + ' secs ago'
  diff = now.diff(mtm, 'minutes')
  if (diff < 0 || diff < 60) return diff.toString() + ' mins ago'
  diff = now.diff(mtm, 'hours')
  if (diff < 0 || diff < 24) return diff.toString() + ' hours ago'
  diff = now.diff(mtm, 'days')
  if (diff < 0 || diff < 7) return diff.toString() + ' days ago'
  diff = now.diff(mtm, 'weeks')
  if (diff < 0 || diff < 5) return diff.toString() + ' weeks ago'
  diff = now.diff(mtm, 'months')
  return diff.toString() + ' months ago'
}

const Form = t.form.Form
export const formStyles = {
  ...Form.stylesheet,
  formGroup: {
    normal: {
      marginBottom: 10
    }
  },
  datepicker: {
    normal: { borderBottomColor: 'gray', borderWidth: 1, marginBottom: 0 },
    error: { borderBottomColor: 'red', borderWidth: 0, borderBottomWidth: 3, marginBottom: 5 }
  },
  helpBlock: {
    normal: { color: 'gray', fontSize: 13, marginBottom: 2, fontStyle: 'italic' },
    error: { color: 'gray', fontSize: 13, marginBottom: 2, fontStyle: 'italic' }
  },
  itemStyle: {
    backgroundColor: 'blue',
    color: 'white'
  },
  controlLabel: {
    normal: {
      color: 'darkblue',
      fontSize: 16,
      marginBottom: 5,
      fontWeight: '100'
    },
    // the style applied when a validation error occours
    error: {
      color: 'red',
      fontSize: 16,
      marginBottom: 5,
      fontWeight: '500'
    }
  }
}

export const getRegionForCoordinates = points => {
  // courtesy -- https://github.com/react-community/react-native-maps/issues/505
  // points should be an array of { latitude: X, longitude: Y }
  let minX,
    maxX,
    minY,
    maxY

    // init first point
  ;(point => {
    minX = point.latitude
    maxX = point.latitude
    minY = point.longitude
    maxY = point.longitude
  })(points[0])

  // calculate rect
  points.map(point => {
    minX = Math.min(minX, point.latitude)
    maxX = Math.max(maxX, point.latitude)
    minY = Math.min(minY, point.longitude)
    maxY = Math.max(maxY, point.longitude)
  })

  const midX = (minX + maxX) / 2
  const midY = (minY + maxY) / 2
  const deltaX = maxX - minX
  const deltaY = maxY - minY

  return {
    latitude: midX,
    longitude: midY,
    latitudeDelta: deltaX + 5,
    longitudeDelta: deltaY + 5
  }
}

export const materialFormStyles = {
  ...formStyles,
  textbox: {
    normal: { borderBottomColor: 'black', borderWidth: 0, marginBottom: 0 },
    error: { borderBottomColor: 'red', borderWidth: 0, borderBottomWidth: 3, marginBottom: 5 }
  },
  textboxView: {
    normal: { borderBottomColor: 'black', borderWidth: 0, borderRadius: 0, borderBottomWidth: 1 },
    error: { borderBottomColor: 'red', borderWidth: 0, borderRadius: 0, borderBottomWidth: 1 }
  }
}
