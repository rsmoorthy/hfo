import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import t from 'tcomb-form-native' // 0.6.9
import { TextInput, StyleSheet, FlatList, TouchableOpacity, TouchableHighlight, Image, Alert } from 'react-native'
import moment from 'moment'
import { UserRatingInfo } from './UserList'

import {
  Container,
  View,
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
  Badge,
  Card,
  CardItem,
  Toast
} from 'native-base'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import R from 'ramda'
const Form = t.form.Form

class AdminScreen extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-apps" style={{ color: tintColor }} />,
    drawerIcon: ({ tintColor }) => <Icon name="ios-apps" style={{ color: tintColor }} />,
    drawerLabel: 'Admin',
    header: null
  }

  componentWillMount() {
    this.props.getServerConfig()
  }

  isRefreshing() {
    if (this.props.meta.pickupListInProgress === undefined) return false
    return this.props.meta.pickupListInProgress
  }

  render() {
    const actions = [
      {
        icon: 'ios-phone-portrait',
        text: 'SMS Templates',
        screen: 'AdminTemplatesList',
        screenParams: { type: 'SMS' }
      },
      { icon: 'ios-mail', text: 'Email Templates', screen: 'AdminTemplatesList', screenParams: { type: 'Email' } },
      {
        icon: 'ios-notifications-outline',
        text: 'Notification Templates',
        screen: 'AdminTemplatesList',
        screenParams: { type: 'Notification' }
      },
      {
        text: 'Server IP',
        value: this.props.config.global ? this.props.config.global.SERVER_IP : '',
        screen: 'ConfigItemForm',
        screenParams: {
          fields: [
            {
              name: 'SERVER_IP',
              type: t.String,
              value: this.props.config.global ? this.props.config.global.SERVER_IP : '',
              label: ' ',
              scope: 'global',
              editable: false,
              help: 'Server IP or Host name'
            }
          ],
          title: 'Server IP'
        }
      },
      {
        text: 'Number of Pickups before affecting Rating',
        value: this.props.config.global ? this.props.config.global.ratingAfterSoManyPickups : '',
        screen: 'ConfigItemForm',
        screenParams: {
          fields: [
            {
              name: 'ratingAfterSoManyPickups',
              type: t.maybe(t.Number),
              value: this.props.config.global ? this.props.config.global.ratingAfterSoManyPickups : '',
              label: ' ',
              scope: 'global',
              help: 'Do rating after so many pickups'
            }
          ],
          title: 'Do Rating after so many pickups'
        }
      },
      {
        text: 'Referral Code for Receiver Role',
        value: this.props.config.global ? this.props.config.global.receiverReferralCode : '',
        screen: 'ConfigItemForm',
        screenParams: {
          fields: [
            {
              name: 'receiverReferralCode',
              type: t.maybe(t.String),
              value: this.props.config.global ? this.props.config.global.receiverReferralCode : '',
              label: ' ',
              scope: 'global',
              help: 'During Signup, specifying this Referral Code sets the role as Receiver'
            }
          ],
          title: 'Referral Code for Receiver Role'
        }
      },
      {
        text: 'Referral Code for Agent Role',
        value: this.props.config.global ? this.props.config.global.agentReferralCode : '',
        screen: 'ConfigItemForm',
        screenParams: {
          fields: [
            {
              name: 'agentReferralCode',
              type: t.maybe(t.String),
              value: this.props.config.global ? this.props.config.global.agentReferralCode : '',
              label: ' ',
              scope: 'global',
              help: 'During Signup, specifying this Referral Code sets the role as Agent'
            }
          ],
          title: 'Referral Code for Agent Role'
        }
      },
      {
        text: 'Referral Code for Display Role',
        value: this.props.config.global ? this.props.config.global.displayReferralCode : '',
        screen: 'ConfigItemForm',
        screenParams: {
          fields: [
            {
              name: 'displayReferralCode',
              type: t.maybe(t.String),
              value: this.props.config.global ? this.props.config.global.displayReferralCode : '',
              label: ' ',
              scope: 'global',
              help: 'During Signup, specifying this Referral Code sets the role as Display'
            }
          ],
          title: 'Referral Code for Display Role'
        }
      },
      {
        text: 'MSG91 Credentials',
        screen: 'ConfigItemForm',
        screenParams: {
          fields: [
            {
              name: 'authkey',
              type: t.String,
              value: this.props.config.smsmsg91 ? this.props.config.smsmsg91.authkey : '',
              label: ' ',
              scope: 'smsmsg91',
              help: 'Auth key for API access for MSG91 SMS service'
            }
          ],
          title: 'MSG91 Credentials'
        }
      },
      {
        text: 'AWS SES Credentials',
        screen: 'ConfigItemForm',
        screenParams: {
          fields: [
            {
              name: 'accessKeyId',
              type: t.String,
              value: this.props.config.sesaws ? this.props.config.sesaws.accessKeyId : '',
              label: ' ',
              scope: 'sesaws',
              help: 'AWS SES Access Key'
            },
            {
              name: 'secretAccessKey',
              type: t.String,
              value: this.props.config.sesaws ? this.props.config.sesaws.secretAccessKey : '',
              label: ' ',
              scope: 'sesaws',
              help: 'AWS SES Secret Key'
            },
            {
              name: 'region',
              type: t.String,
              value: this.props.config.sesaws ? this.props.config.sesaws.region : '',
              label: ' ',
              scope: 'sesaws',
              help: 'AWS SES Region'
            }
          ],
          title: 'AWS SES Credentials'
        }
      },
      {
        text: 'Flightaware Credentials',
        screen: 'ConfigItemForm',
        screenParams: {
          fields: [
            {
              name: 'user',
              type: t.String,
              value: this.props.config.flightaware ? this.props.config.flightaware.user : '',
              label: ' ',
              scope: 'flightaware',
              help: 'User name for Flightaware'
            },
            {
              name: 'pass',
              type: t.String,
              value: this.props.config.flightaware ? this.props.config.flightaware.pass : '',
              label: ' ',
              scope: 'flightaware',
              help: 'Password for Flightaware'
            }
          ],
          title: 'Flightaware Credentials'
        }
      },
      {
        text: 'Flightstats Credentials',
        screen: 'ConfigItemForm',
        screenParams: {
          fields: [
            {
              name: 'appId',
              type: t.String,
              value: this.props.config.flightstats ? this.props.config.flightstats.appId : '',
              label: ' ',
              scope: 'flightstats',
              help: 'App Id for Flightstats'
            },
            {
              name: 'appKey',
              type: t.String,
              value: this.props.config.flightstats ? this.props.config.flightstats.appKey : '',
              label: ' ',
              scope: 'flightstats',
              help: 'App Key for Flightstats'
            }
          ],
          title: 'Flightstats Credentials'
        }
      }
    ]
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="menu" onPress={this.props.navigation.openDrawer} />
            </Button>
          </Left>
          <Body>
            <Title>Admin Screen</Title>
          </Body>
        </Header>
        <Content>
          <Card>
            <CardItem header bordered>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>Admin Actions</Text>
            </CardItem>
            {actions.map((item, index) => (
              <CardItem
                bordered
                button
                key={index}
                onPress={() => this.props.navigation.push(item.screen, { opts: item.screenParams })}>
                {item.icon && <Icon name={item.icon} />}
                <Body>
                  <Text style={{ fontSize: 14 }}>{item.text}</Text>
                </Body>
                <Right>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 14, color: '#333', paddingRight: 20 }}>{item.value}</Text>
                    <Icon style={{ color: '#999' }} name="ios-arrow-dropright" />
                  </View>
                </Right>
              </CardItem>
            ))}
          </Card>
        </Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'meta', 'config']), utils.mapDispatchToProps)(AdminScreen)

class _AdminTemplatesList extends Component {
  static navigationOptions = {
    header: null
  }

  getTemplates() {
    this.props.getTemplates((err, message) => {
      if (err) Alert.alert('Failed to get templates: ' + err)
    })
  }
  componentWillMount() {
    this.getTemplates()
  }
  render() {
    const p = this.props.navigation.getParam('opts', { type: 'SMS' })
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="md-arrow-back" onPress={() => this.props.navigation.goBack()} />
            </Button>
          </Left>
          <Body>
            <Title>{p.type} Templates</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.push('AdminTemplatesForm', { type: p.type })}>
              <Icon name="ios-add" />
            </Button>
          </Right>
        </Header>
        <Content>
          <FlatList
            data={
              p.type === 'SMS'
                ? this.props.smsTemplates
                : p.type === 'Email'
                  ? this.props.emailTemplates
                  : p.type === 'Notification'
                    ? this.props.notificationTemplates
                    : []
            }
            refreshing={this.props.meta.adminInProgress}
            onRefresh={() => this.getTemplates()}
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={() => (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'gray', marginTop: 10, fontStyle: 'italic' }}>No {p.type} Template</Text>
              </View>
            )}
            renderItem={({ item, index, separators }) => (
              <TouchableHighlight
                onPress={() => this.props.navigation.push('AdminTemplatesForm', { template: item, type: p.type })}
                onShowUnderlay={separators.highlight}
                onHideUnderlay={separators.unhighlight}>
                <View style={{ padding: 5, margin: 6, backgroundColor: '#F8F8F8' }}>
                  <Text style={{ fontSize: 12, color: 'black' }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: 'gray', fontFamily: 'monospace' }}>{item.template}</Text>
                </View>
              </TouchableHighlight>
            )}
          />
        </Content>
      </Container>
    )
  }
}

export const AdminTemplatesList = connect(
  utils.mapStateToProps('hfo', ['login', 'meta', 'smsTemplates', 'emailTemplates', 'notificationTemplates']),
  utils.mapDispatchToProps
)(_AdminTemplatesList)

class _AdminTemplatesForm extends Component {
  static navigationOptions = {
    header: null
  }

  getType = () => {
    const template = this.props.navigation.getParam('template', null)
    const names = [
      'OTP',
      'WelcomePassenger',
      'NotifyReceiver',
      'PassengerTripCompleted',
      'ReceiverTripCompleted',
      'ReminderPickupPassenger',
      'ReminderPickupReceiver',
      'ResetPassword'
    ]
    const struct = {
      type: t.enums({ SMS: 'SMS', Email: 'Email', Notification: 'Notification' }),
      name: t.enums(R.zipObj(names, names)),
      template: t.String
    }
    if (template) return t.struct({ _id: t.String, ...struct })
    else return t.struct(struct)
  }

  constructor(props) {
    super(props)
    const type = this.props.navigation.getParam('type', null)
    this.state = {
      type: this.getType(),
      value: {
        _id: '',
        type: type,
        name: '',
        template: ''
      },
      options: {
        fields: {
          _id: { hidden: true },
          type: { hidden: true, editable: false },
          name: {
            template: require('../utils/select.android')
          },
          template: {
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
      if (value._id)
        this.props.doUpdateTemplate(value, (err, message) => {
          if (err) Alert.alert('Failed to Update', err)
          else {
            Toast.show({ text: 'Updated Successfully', buttonText: 'Ok', type: 'success', duration: 5000 })
            this.props.navigation.goBack()
          }
        })
      else
        this.props.doAddTemplate(value, (err, message) => {
          if (err) {
            Alert.alert('Error in Flight check', err)
          } else {
            this.props.navigation.goBack()
            Toast.show({ text: 'Added Successfully', buttonText: 'Ok', type: 'success', duration: 5000 })
          }
        })
    }
  }

  componentWillMount() {
    const template = this.props.navigation.getParam('template', null)
    const type = this.props.navigation.getParam('type', null)
    if (template) this.setState({ value: template })
    else {
      this.setState({ value: { ...this.state.value, type: type } })
    }
  }

  render() {
    const template = this.props.navigation.getParam('template', null)
    const type = this.props.navigation.getParam('type', null)
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="md-arrow-back" onPress={() => this.props.navigation.goBack()} />
            </Button>
          </Left>
          <Body>
            <Text style={{ fontSize: 20, color: 'white' }}>Template Edit</Text>
          </Body>
        </Header>
        <Content>
          <View style={styles.container}>
            <Card>
              <CardItem bordered>
                <Text>{type} Template</Text>
              </CardItem>
              <CardItem>
                <View style={{ width: '100%', alignSelf: 'stretch' }}>
                  <Form
                    ref={c => (this._form = c)}
                    type={this.state.type}
                    value={this.state.value}
                    options={this.state.options}
                  />
                </View>
              </CardItem>
              <CardItem>
                <Button info block title="Submit!" style={{ width: '100%' }} onPress={this.handleSubmit}>
                  <Text> Submit </Text>
                </Button>
              </CardItem>
              <CardItem>
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

export const AdminTemplatesForm = connect(
  utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']),
  utils.mapDispatchToProps
)(_AdminTemplatesForm)

class _ConfigItemForm extends Component {
  static navigationOptions = {
    header: null
  }

  getType = () => {
    const opts = this.props.navigation.getParam('opts', null)
    const struct = {}
    const value = {}
    const options = {
      fields: {},
      stylesheet: utils.formStyles
    }

    opts.fields.forEach((field, index) => {
      struct[field.name] = field.type || t.maybe(t.String)
      value[field.name] = field.value || ''
      options.fields[field.name] = {}

      /// update various fields
      let flds = ['label', 'help', 'editable', 'hidden']
      flds.forEach(fld => (options.fields[field.name][fld] = field[fld]))
    })
    return [t.struct(struct), value, options]
  }

  constructor(props) {
    super(props)
    let [type, value, options] = this.getType()

    this.state = {
      type: type,
      value: value,
      options: options
    }
  }

  handleSubmit = () => {
    const opts = this.props.navigation.getParam('opts', null)
    const value = this._form.getValue()
    if (value) {
      this.state.value = value
      var val = { ...value }
      opts.fields.forEach(field => {
        if (field.scope) {
          val[field.scope] = val[field.scope] ? val[field.scope] : {}
          val[field.scope][field.name] = val[field.name]
          delete val[field.name]
        }
      })
      this.props.doUpdateServerConfig(val, (err, message) => {
        if (err) Alert.alert('Failed to Update', err)
        else {
          Toast.show({ text: 'Updated Successfully', buttonText: 'Ok', duration: 1000 })
          this.props.navigation.goBack()
        }
      })
    }
  }

  render() {
    const opts = this.props.navigation.getParam('opts', {})
    const title = opts.title || 'Config'
    return (
      <Container>
        <Header
          style={{
            backgroundColor: '#eee',
            paddingLeft: 10,
            paddingTop: getStatusBarHeight(),
            height: 54 + getStatusBarHeight()
          }}>
          <Left>
            <Button
              transparent
              small
              style={{ padding: 10, borderColor: '#666', borderWidth: 1 }}
              onPress={() => this.props.navigation.goBack()}>
              <Text uppercase={false} style={{ color: 'black', fontSize: 11, fontWeight: 'bold' }}>
                Cancel
              </Text>
            </Button>
          </Left>
          <Body>
            <Text style={{ fontSize: 14, color: 'black', fontWeight: 'bold' }}>{title}</Text>
          </Body>
          <Left>
            <Button primary small style={{ padding: 10 }} onPress={() => this.handleSubmit()}>
              <Text>OK</Text>
            </Button>
          </Left>
        </Header>
        <Content style={{ backgroundColor: '#fefefe' }}>
          <View style={{ backgroundColor: '#fefefe', padding: 20, width: '100%', alignSelf: 'stretch' }}>
            <Form
              ref={c => (this._form = c)}
              type={this.state.type}
              value={this.state.value}
              options={this.state.options}
            />
          </View>
        </Content>
      </Container>
    )
  }
}

export const ConfigItemForm = connect(
  utils.mapStateToProps('hfo', ['login', 'meta', 'config']),
  utils.mapDispatchToProps
)(_ConfigItemForm)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
