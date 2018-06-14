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
    drawerName: 'Admin',
    header: null
  }

  componentWillMount() {}

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
      { icon: 'ios-mail', text: 'Email Templates', screen: 'AdminTemplatesList', screenParams: { type: 'Email' } }
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
              <Text style={{ fontSize: 20, color: 'darkblue' }}>Admin Actions</Text>
            </CardItem>
            {actions.map((item, index) => (
              <CardItem
                bordered
                button
                key={index}
                onPress={() => this.props.navigation.push(item.screen, { opts: item.screenParams })}>
                <Icon name={item.icon} />
                <Text>{item.text}</Text>
                <Right>
                  <Icon name="arrow-forward" />
                </Right>
              </CardItem>
            ))}
          </Card>
        </Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'meta']), utils.mapDispatchToProps)(AdminScreen)

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
              <Icon name="ios-arrow-back" onPress={() => this.props.navigation.goBack()} />
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
            data={p.type === 'SMS' ? this.props.smsTemplates : this.props.emailTemplates}
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
  utils.mapStateToProps('hfo', ['login', 'meta', 'smsTemplates', 'emailTemplates']),
  utils.mapDispatchToProps
)(_AdminTemplatesList)

class _AdminTemplatesForm extends Component {
  static navigationOptions = {
    header: null
  }

  getType = () => {
    const template = this.props.navigation.getParam('template', null)
    const struct = {
      type: t.enums({ SMS: 'SMS', Email: 'Email' }),
      name: t.String,
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
          type: { hidden: true },
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
    this.setState({ value: template })
  }

  render() {
    const template = this.props.navigation.getParam('template', null)
    const type = this.props.navigation.getParam('type', null)
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="ios-arrow-back" onPress={() => this.props.navigation.goBack()} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
