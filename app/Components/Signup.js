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
  email: t.String,
  mobile: t.maybe(t.String),
  password: t.String,
  role: t.enums({
    Receiver: 'Receiver',
    Passenger: 'Passenger',
    Admin: 'Admin',
    BookingAgent: 'BookingAgent',
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
      error: 'For receivers, mobile is mandatory'
    },
    password: {
      error: 'A good password',
      secureTextEntry: true
    },
    terms: {
      label: 'Agree to Terms'
    }
  },
  stylesheet: utils.formStyles
}

class Signup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: {
        role: 'Passenger',
        name: 'Moorthy RS',
        email: 'rsmoorthy@gmail.com',
        mobile: '9980018517',
        password: 'rsm123'
      }
    }
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
        <Content style={{ backgroundColor: '#f3f3f6' }}>
          <View style={styles.container}>
            {this.props.signup.inProgress ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              this.props.signup.successMessage === '' && (
                <View>
                  <Form ref={c => (this._form = c)} type={User} value={this.state.value} options={options} />
                  <Button title="Sign Up!" onPress={this.handleSubmit} />
                </View>
              )
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
    marginTop: 50,
    padding: 20,
    backgroundColor: '#f3f3f6'
  }
})
