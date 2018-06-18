import React, { Component } from 'react'
import { View, ScrollView, Text, StatusBar, ActivityIndicator, StyleSheet, Button } from 'react-native'
import t from 'tcomb-form-native' // 0.6.9
import { connect } from 'react-redux'
import * as utils from '../utils'

import { Container, Content, Icon, Thumbnail, Header, Left, Right, Body, Title, List, ListItem } from 'native-base'
import { getStatusBarHeight } from 'react-native-status-bar-height'

const Form = t.form.Form

const User = t.struct({
  name: t.String,
  email: t.maybe(t.String),
  mobile: t.maybe(t.String),
  password: t.String,
  role: t.enums({
    Receiver: 'Receiver',
    Passenger: 'Passenger',
    Admin: 'Admin',
    Agent: 'Agent',
    Display: 'Display'
  }),
  terms: t.Boolean
})

const options = {
  fields: {
    email: {
      error: 'Require a valid email address?'
    },
    mobile: {
      help: 'Either email or mobile is mandatory'
    },
    password: {
      error: 'A good password',
      secureTextEntry: true
    },
    terms: {
      label: 'Agree to Terms'
    },
    role: {
      hidden: true,
      default: 'Passenger'
    },
    id: {
      hidden: true
    },
    otp: {
      label: 'Enter OTP',
      help: 'Please enter the 6 digit OTP sent to your email/mobile'
    }
  },
  stylesheet: utils.formStyles
}

const UserOTP = t.struct({
  id: t.String,
  otp: t.Number
})

class Signup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: {
        role: 'Passenger',
        name: '',
        email: '',
        mobile: '',
        password: ''
      },
      value2: {
        id: '',
        otp: ''
      }
    }
    this.timer1 = null
  }

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-chatboxes" style={{ color: tintColor }} />
  }

  handleSubmit = () => {
    const value = this._form.getValue()
    if (value) {
      this.state.value = value
      this.props.doSignup(value)
    }
  }

  handleSubmit2 = () => {
    const value2 = this._form2.getValue()
    if (value2) {
      this.state.value2 = value2
      this.props.doSignupVerify(value2)
    }
  }

  componentDidUpdate() {
    if (this.props.signup.needAuthCode && this.state.value2.id && !this.timer1) {
      this.timer1 = setInterval(() => {
        this.props.signupCheck(this.state.value2.id)
      }, 5000)
    }
    if (this.props.signup.needAuthCode === false && this.timer1) clearInterval(this.timer1)
  }

  componentWillUnmount() {
    if (this.timer1) clearInterval(this.timer1)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.signup.id && (state.value2.id === undefined || state.value2.id === ''))
      return { value2: { ...state.value2, id: props.signup.id } }
    return null
  }

  render() {
    return (
      <Container>
        <Header tyle={{ paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <StatusBar hidden={true} barStyle="dark-content" />
          <Left>
            <Icon name="menu" />
          </Left>
          {/* <Body><Text style={{ fontSize: 20, color: 'white' }}>Signup</Text></Body> */}
          <Body>
            <Title>Signup</Title>
          </Body>
        </Header>
        <Content style={{ backgroundColor: '#EAE8EF' }}>
          <View style={styles.container}>
            {this.props.signup.inProgress ? (
              <ActivityIndicator size="large" color="blue" />
            ) : (
              this.props.signup.successMessage === '' &&
              (this.props.signup.needAuthCode === true ? (
                <View>
                  <Form ref={c => (this._form2 = c)} type={UserOTP} value={this.state.value2} options={options} />
                  <Button title="Submit OTP" onPress={this.handleSubmit2} />
                  <Text style={{ marginTop: 8 }} />
                  <Button
                    title="Go back to Login page"
                    onPress={() => {
                      this.props.resetSignup()
                      this.props.navigation.navigate('Login')
                    }}
                  />
                </View>
              ) : (
                <View>
                  <Form ref={c => (this._form = c)} type={User} value={this.state.value} options={options} />
                  <Button title="Sign Up!" onPress={this.handleSubmit} />
                  <Text style={{ marginTop: 8 }} />
                  <Button
                    title="Go back to Login page"
                    onPress={() => {
                      this.props.resetSignup()
                      this.props.navigation.navigate('Login')
                    }}
                  />
                </View>
              ))
            )}
            {this.props.signup.successMessage !== '' && (
              <View>
                <Text style={{ color: 'green', fontSize: 32 }}>{this.props.signup.successMessage}</Text>
                <Button
                  title="Sign In"
                  onPress={() => {
                    this.props.resetSignup()
                    this.props.navigation.navigate('Login')
                  }}
                />
              </View>
            )}
            <Text style={{ color: 'red' }}>{this.props.signup.errorMessage}</Text>
            <View style={{ height: 300 }}>
              <Text> </Text>
            </View>
          </View>
        </Content>
      </Container>
    )
  }
}

export default connect(utils.mapStateToProps('hfo', ['signup']), utils.mapDispatchToProps)(Signup)

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 5,
    padding: 20,
    backgroundColor: 'white'
  }
})
