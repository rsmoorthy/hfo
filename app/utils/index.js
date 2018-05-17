import * as R from 'ramda'
import { bindActionCreators } from 'redux'
import * as actionCreators from '../actions'
import t from 'tcomb-form-native' // 0.6.9

export const mapStateToProps = R.curry((base, keys, state) => {
  var r = R.pick(keys, state[base])
  return r
})
export const mapDispatchToProps = dispatch => {
  let actions = bindActionCreators(actionCreators, dispatch)
  return { ...actions, dispatch }
}

const Form = t.form.Form
export const formStyles = {
  ...Form.stylesheet,
  formGroup: {
    normal: {
      marginBottom: 10
    }
  },
  textbox: {
    normal: { borderBottomColor: 'black', borderWidth: 0, marginBottom: 0 },
    error: { borderBottomColor: 'red', borderWidth: 0, borderBottomWidth: 3, marginBottom: 5 }
  },
  textboxView: {
    normal: { borderBottomColor: 'black', borderWidth: 0, borderRadius: 0, borderBottomWidth: 1 },
    error: { borderBottomColor: 'red', borderWidth: 0, borderRadius: 0, borderBottomWidth: 1 }
  },
  controlLabel: {
    normal: {
      fontFamily: 'Roboto_medium',
      color: 'blue',
      fontSize: 16,
      marginBottom: 5,
      fontWeight: '500'
    },
    // the style applied when a validation error occours
    error: {
      fontFamily: 'Roboto_medium',
      color: 'blue',
      fontSize: 16,
      marginBottom: 5,
      fontWeight: '500'
    }
  }
}
