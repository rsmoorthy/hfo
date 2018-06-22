import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { View, StatusBar, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import moment from 'moment'
import t from 'tcomb-form-native' // 0.6.9
import StarRating from 'react-native-star-rating'
import {
  Container,
  Content,
  Icon,
  Thumbnail,
  Header,
  Left,
  Title,
  Right,
  Body,
  List,
  ListItem,
  Button,
  Text,
  StyleProvider,
  Toast,
  Badge
} from 'native-base'
import { getStatusBarHeight } from 'react-native-status-bar-height'
// import getTheme from '../../native-base-theme/components'
// import material from '../../native-base-theme/variables/material'
// import platform from '../../native-base-theme/variables/platform'
import R from 'ramda'
const Form = t.form.Form

class ModalScreen extends Component {
  componentDidMount() {
    this.props.setOpacity(0.1)
  }

  componentWillUnmount() {
    this.props.setOpacity(1.0)
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ backgroundColor: 'white', borderColor: 'red', borderWidth: 4 }}>
          <Text>Hello Modal</Text>
        </View>
      </View>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['meta']), utils.mapDispatchToProps)(ModalScreen)

class _FeedbackModal extends Component {
  static navigationOptions = {
    header: null
  }

  getType = () => {
    return t.struct({
      _id: t.String,
      rating: t.maybe(t.Number),
      status: t.String,
      feedback: t.maybe(t.String)
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      inProgress: false,
      type: this.getType(),
      value: {
        _id: '',
        status: 'Completed',
        rating: 0,
        feedback: ''
      },
      options: {
        fields: {
          _id: { hidden: true, editable: false },
          status: { hidden: true, editable: false },
          rating: { hidden: true, editable: false },
          feedback: {
            label: 'Feedback',
            placeholder: 'Provide your valuable Feedback',
            multiline: true,
            stylesheet: {
              ...Form.stylesheet,
              textbox: {
                ...Form.stylesheet.textbox,
                normal: {
                  ...Form.stylesheet.textbox.normal,
                  height: 100,
                  textAlignVertical: 'top',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  padding: 5
                },
                error: {
                  ...Form.stylesheet.textbox.error,
                  height: 100,
                  textAlignVertical: 'top',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  padding: 5
                }
              }
            },
            numberOfLines: 8
          }
        },
        stylesheet: utils.formStyles
      }
    }
  }

  handleSubmit = () => {
    const value = this._form.getValue()
    if (value) {
      this.state.value = value
      if (value._id) {
        this.setState({ inProgress: true })
        this.props.doCompletePickup(value, (err, message) => {
          this.setState({ inProgress: false })
          if (err) Alert.alert('Failed to submit Feedback', err)
          else {
            Toast.show({ text: 'Updated Successfully', buttonText: 'Ok', type: 'success', duration: 1500 })
            this.props.navigation.goBack()
          }
        })
      }
    }
  }

  componentWillMount() {
    const pickup = this.props.navigation.getParam('pickup', null)
    if (pickup) {
      this.setState({
        value: {
          _id: pickup._id,
          status: pickup.status ? pickup.status : 'Completed',
          rating: pickup.rating === undefined || pickup.rating === null ? 0 : pickup.rating,
          feedback: pickup.feedback
        }
      })
    }
  }

  componentDidMount() {
    this.props.setOpacity(0.1)
  }

  componentWillUnmount() {
    this.props.setOpacity(1.0)
  }

  render() {
    const pickup = this.props.navigation.getParam('pickup', null)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ backgroundColor: 'white', borderColor: 'gray', width: '80%', borderRadius: 8, borderWidth: 1 }}>
          <Icon name="close-circle" style={{ alignSelf: 'flex-end' }} onPress={() => this.props.navigation.goBack()} />
          {this.state.inProgress === true && <ActivityIndicator size="large" color="#000" />}
          <View style={{ padding: 20, width: '100%', alignSelf: 'stretch' }}>
            <StarRating
              disabled={false}
              maxStars={5}
              rating={this.state.value.rating}
              selectedStar={rating => this.setState({ value: { ...this.state.value, rating: rating } })}
            />
            <Form
              ref={c => (this._form = c)}
              type={this.state.type}
              value={this.state.value}
              options={this.state.options}
            />
          </View>
          <Button
            info
            disabled={this.state.inProgress}
            block
            title="Submit Feedback"
            style={{ width: '100%' }}
            onPress={this.handleSubmit}>
            <Text> Submit Feedback </Text>
          </Button>
        </View>
      </View>
    )
  }
}

export const FeedbackModal = connect(
  utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']),
  utils.mapDispatchToProps
)(_FeedbackModal)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
