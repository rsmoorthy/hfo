import React, { Component } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { connect } from 'react-redux'
import * as utils from '../utils'
import t from 'tcomb-form-native' // 0.6.9
import moment from 'moment'
import { store } from '../store'
import {
  Container,
  Content,
  Icon,
  Thumbnail,
  Header,
  Left,
  Right,
  Body,
  List,
  ListItem,
  Button,
  Text,
  Card,
  CardItem,
  Toast,
  Badge
} from 'native-base'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import R from 'ramda'
const Form = t.form.Form
// t.form.Form.templates = { ...t.form.Form.templates, select: require('../utils/select.android.js') }

class PickupForm extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
    drawerIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
    header: null
  }

  getType = (passengers, receivers, o = {}) => {
    const pickup = this.props.navigation.getParam('pickup', null)
    if (pickup) {
      return t.struct({
        _id: t.String,
        passengerId: t.maybe(t.String),
        name: t.maybe(t.String),
        email: t.maybe(t.String),
        mobile: t.maybe(t.String),
        airport: t.enums({ Bangalore: 'Bangalore' }),
        flight: t.String,
        pickupDate: t.Date,
        receiverId: t.maybe(t.enums(receivers))
      })
    }
    R.forEach(
      x => {
        if (!(x in o)) o[x] = false
      },
      ['name', 'email', 'mobile', 'passengerId']
    )
    return t.struct({
      passengerId: o.passengerId ? t.maybe(t.enums(passengers)) : t.enums(passengers),
      name: o.name ? t.maybe(t.String) : t.String,
      email: o.email ? t.maybe(t.String) : t.String,
      mobile: o.mobile ? t.maybe(t.String) : t.String,
      airport: t.enums({ Bangalore: 'Bangalore' }),
      flight: t.String,
      pickupDate: t.Date,
      receiverId: t.maybe(t.enums(receivers))
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      type: this.getType({}, {}, {}),
      value: {
        passengerId: '',
        name: '',
        email: '',
        mobile: '',
        airport: 'Bangalore',
        flight: '',
        pickupDate: moment()
          .startOf('day')
          .toDate(),
        receiverId: ''
      },
      options: {
        fields: {
          _id: { hidden: true },
          name: { hidden: false, editable: true },
          email: { hidden: false, editable: true },
          mobile: { hidden: false, editable: true },
          airport: {
            template: require('../utils/select.android')
          },
          receiverId: {
            template: require('../utils/select.android')
          },
          passengerId: {
            template: require('../utils/select.android'),
            hidden: false,
            label: 'Existing User'
          },
          flight: {
            autoCapitalize: 'characters',
            help: 'Flight number in the format of XXNNN (like 6E1234)'
          },
          pickupDate: {
            template: require('../utils/datepicker.android'),
            label: 'Pickup Date',
            mode: 'date',
            config: {
              format: date => moment(date).format('YYYY-MM-DD')
            }
          }
        },
        stylesheet: utils.formStyles
      }
    }
  }

  onChange = value => {
    const pickup = this.props.navigation.getParam('pickup', null)
    if (pickup === null) {
      var options = t.update(this.state.options, {
        fields: {
          name: { hidden: { $set: value.passengerId.length > 0 } },
          email: { hidden: { $set: value.passengerId.length > 0 } },
          mobile: { hidden: { $set: value.passengerId.length > 0 } },
          passengerId: { hidden: { $set: value.name && value.name.length > 0 } }
        }
      })
      this.setState({ options: options })
    }
    let state = store.getState()
    this.setState({
      value: value,
      type: this.getType(state.hfo.passengers, state.hfo.receivers, {
        name: value.passengerId.length > 0,
        email: value.passengerId.length > 0,
        mobile: value.passengerId.length > 0,
        passengerId: value.name && value.name.length > 0
      })
    })
  }

  handleSubmit = () => {
    const value = this._form.getValue()
    if (value) {
      this.state.value = value
      if (value._id) this.props.doUpdatePickup(value)
      else
        this.props.doAddPickup({
          ...value,
          callback: (err, message) => {
            if (err) {
              Alert.alert('Error in Flight check', err)
            } else {
              // Alert.alert('Flight check Success', message)
              this.props.navigation.navigate('Pickups')
              Toast.show({
                text: 'Updated Successfully. Flight: ' + message,
                buttonText: 'Ok',
                type: 'success',
                duration: 20000
              })
            }
          }
        })
    }
  }

  componentWillMount() {
    const pickup = this.props.navigation.getParam('pickup', null)
    if (pickup) {
      let options = t.update(this.state.options, {
        fields: {
          name: { editable: { $set: false } },
          email: { editable: { $set: false } },
          mobile: { editable: { $set: false } },
          passengerId: { hidden: { $set: true } }
        }
      })
      this.setState({ options: options })
      pickup.pickupDate = moment(pickup.pickupDate).toDate()
      this.setState({ value: pickup })
    }
    let state = store.getState()
    let passengers = { ...state.hfo.passengers }
    let receivers = { ...state.hfo.receivers }
    this.setState({ type: this.getType(state.hfo.passengers, state.hfo.receivers) })
    store.subscribe(() => {
      let state = store.getState()
      if (
        Object.keys(passengers).length !== Object.keys(state.hfo.passengers).length ||
        Object.keys(receivers).length !== Object.keys(state.hfo.receivers).length
      ) {
        passengers = { ...state.hfo.passengers }
        receivers = { ...state.hfo.receivers }
        this.setState({ type: this.getType(state.hfo.passengers, state.hfo.receivers) })
      }
    })
    this.props.getUserList()
  }

  render() {
    const pickup = this.props.navigation.getParam('pickup', null)
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              {pickup === null ? (
                <Icon name="menu" onPress={this.props.navigation.openDrawer} />
              ) : (
                <Icon name="ios-arrow-back" onPress={() => this.props.navigation.goBack()} />
              )}
            </Button>
          </Left>
          <Body>
            <Text style={{ fontSize: 20, color: 'white' }}>{pickup === null ? 'New Pickup' : 'Pickup'}</Text>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.getUserList()}>
              <Icon name="ios-refresh" />
            </Button>
            <Button transparent onPress={() => this.props.doLogout()}>
              <Icon name="ios-log-out" />
            </Button>
          </Right>
        </Header>
        <Content>
          <View style={styles.container}>
            <Card>
              <CardItem bordered>
                <Text>{pickup === null ? 'New Pickup Form' : 'Pickup Form'}</Text>
              </CardItem>
              <CardItem>
                <View style={{ width: '100%', alignSelf: 'stretch' }}>
                  <Form
                    ref={c => (this._form = c)}
                    type={this.state.type}
                    value={this.state.value}
                    options={this.state.options}
                    onChange={this.onChange}
                  />
                </View>
              </CardItem>
              <CardItem>
                <Button info block title="Submit!" style={{ width: '100%' }} onPress={this.handleSubmit}>
                  <Text> Submit </Text>
                </Button>
              </CardItem>
              <CardItem>
                <Text style={{ color: 'red', fontSize: 22 }}>{this.props.meta.pickupError}</Text>
                <Text style={{ color: 'green', fontSize: 22 }}>{this.props.meta.pickupSuccess}</Text>
                <View style={{ height: 300 }}>
                  <Text> </Text>
                </View>
              </CardItem>
            </Card>
          </View>
        </Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']), utils.mapDispatchToProps)(
  PickupForm
)

class _AssignReceiverModal extends Component {
  static navigationOptions = {
    header: null
  }

  getType = receivers => {
    return t.struct({
      _id: t.String,
      receiverId: t.enums(receivers || {})
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      type: this.getType(this.props.receivers),
      value: {
        _id: '',
        receiverId: ''
      },
      options: {
        fields: {
          _id: { hidden: true, editable: false },
          receiverId: {
            template: require('../utils/select.android'),
            label: 'Assign Receiver'
          }
        },
        stylesheet: utils.formStyles
      }
    }
  }

  handleSubmit = () => {
    const value = this._form.getValue()
    console.log('value', value)
    if (value) {
      this.state.value = value
      if (value._id) {
        this.props.doUpdatePickup({
          ...value,
          callback: (err, message) => {
            if (err) Alert.alert('Failed to Assign receiver', err)
            else {
              Toast.show({ text: 'Updated Successfully', buttonText: 'Ok', type: 'success', duration: 5000 })
              this.props.navigation.goBack()
            }
          }
        })
      }
    }
  }

  componentWillMount() {
    const pickup = this.props.navigation.getParam('pickup', null)
    this.setState({ value: { _id: pickup ? pickup._id : '', receiverId: pickup ? pickup.receiverId : '' } })
    let state = store.getState()
    let receivers = { ...state.hfo.receivers }
    this.setState({ type: this.getType(state.hfo.receivers) })
    store.subscribe(() => {
      let state = store.getState()
      if (Object.keys(receivers).length !== Object.keys(state.hfo.receivers).length) {
        receivers = { ...state.hfo.receivers }
        this.setState({ type: this.getType(state.hfo.receivers) })
      }
    })
    this.props.getUserList('Receiver')
  }

  render() {
    const pickup = this.props.navigation.getParam('pickup', null)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ backgroundColor: 'white', borderColor: 'gray', width: '80%', borderRadius: 8, borderWidth: 1 }}>
          <Icon name="close-circle" style={{ alignSelf: 'flex-end' }} onPress={() => this.props.navigation.goBack()} />
          <View style={{ padding: 20, width: '100%', alignSelf: 'stretch' }}>
            <Form
              ref={c => (this._form = c)}
              type={this.state.type}
              value={this.state.value}
              options={this.state.options}
            />
          </View>
          <Button info block title="Assign" style={{ width: '100%' }} onPress={this.handleSubmit}>
            <Text> Assign </Text>
          </Button>
        </View>
      </View>
    )
  }
}
export const AssignReceiverModal = connect(
  utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']),
  utils.mapDispatchToProps
)(_AssignReceiverModal)

class _RequestPickup extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
    drawerIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
    header: null
  }

  getType = (passengers, receivers, o = {}) => {
    const pickup = this.props.navigation.getParam('pickup', null)
    const struct = {
      passengerId: t.String,
      airport: t.enums({ Bangalore: 'Bangalore' }),
      flight: t.String,
      pickupDate: t.Date
    }
    if (pickup) return t.struct({ _id: t.String, ...struct })
    else return t.struct(struct)
  }

  constructor(props) {
    super(props)
    this.state = {
      type: this.getType({}, {}, {}),
      value: {
        _id: '',
        passengerId: this.props.login.id,
        airport: 'Bangalore',
        flight: '',
        pickupDate: moment()
          .startOf('day')
          .toDate()
      },
      options: {
        fields: {
          _id: { hidden: true },
          passengerId: {
            template: require('../utils/select.android'),
            hidden: true
          },
          airport: {
            template: require('../utils/select.android')
          },
          receiverId: {
            template: require('../utils/select.android')
          },
          flight: {
            autoCapitalize: 'characters',
            help: 'Flight number in the format of XXNNN (like 6E1234)'
          },
          pickupDate: {
            template: require('../utils/datepicker.android'),
            label: 'Pickup Date',
            mode: 'date',
            config: {
              format: date => moment(date).format('YYYY-MM-DD')
            }
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
      if (value._id)
        this.props.doUpdatePickup({
          ...value,
          callback: (err, message) => {
            if (err) Alert.alert('Failed to Update', err)
            else {
              Toast.show({ text: 'Updated Successfully', buttonText: 'Ok', type: 'success', duration: 5000 })
              this.props.navigation.goBack()
            }
          }
        })
      else
        this.props.doAddPickup({
          ...value,
          callback: (err, message) => {
            if (err) {
              Alert.alert('Error in Flight check', err)
            } else {
              // Alert.alert('Flight check Success', message)
              this.props.navigation.navigate(this.props.login.role === 'Passenger' ? 'PassengerHome' : 'Pickups')
              Toast.show({
                text: 'Requested Successfully. Flight: ' + message,
                buttonText: 'Ok',
                type: 'success',
                duration: 20000
              })
            }
          }
        })
    }
  }

  componentWillMount() {
    const pickup = this.props.navigation.getParam('pickup', null)
  }

  render() {
    const pickup = this.props.navigation.getParam('pickup', null)
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              {pickup === null ? (
                <Icon name="menu" onPress={this.props.navigation.openDrawer} />
              ) : (
                <Icon name="ios-arrow-back" onPress={() => this.props.navigation.goBack()} />
              )}
            </Button>
          </Left>
          <Body>
            <Text style={{ fontSize: 20, color: 'white' }}>{pickup === null ? 'New Pickup' : 'Pickup'}</Text>
          </Body>
        </Header>
        <Content>
          <View style={styles.container}>
            <Card>
              <CardItem bordered>
                <Text>{pickup === null ? 'Request Pickup' : 'Pickup Form'}</Text>
              </CardItem>
              <CardItem>
                <View style={{ width: '100%', alignSelf: 'stretch' }}>
                  <Form
                    ref={c => (this._form = c)}
                    type={this.state.type}
                    value={this.state.value}
                    options={this.state.options}
                    onChange={this.onChange}
                  />
                </View>
              </CardItem>
              <CardItem>
                <Button info block title="Submit!" style={{ width: '100%' }} onPress={this.handleSubmit}>
                  <Text> Submit </Text>
                </Button>
              </CardItem>
              <CardItem>
                <Text style={{ color: 'red', fontSize: 22 }}>{this.props.meta.pickupError}</Text>
                <Text style={{ color: 'green', fontSize: 22 }}>{this.props.meta.pickupSuccess}</Text>
                <View style={{ height: 300 }}>
                  <Text> </Text>
                </View>
              </CardItem>
            </Card>
          </View>
        </Content>
      </Container>
    )
  }
}

export const RequestPickup = connect(
  utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']),
  utils.mapDispatchToProps
)(_RequestPickup)

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 10,
    backgroundColor: 'white',
    justifyContent: 'center'
  }
})
