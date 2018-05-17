import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, Button, ActivityIndicator, StatusBar } from 'react-native'
import { Icon } from 'native-base'

import t from 'tcomb-form-native' // 0.6.9
import { connect } from 'react-redux'
import * as utils from '../utils'

const Form = t.form.Form
const LoginForm = t.struct({
  email: t.String,
  password: t.String
})

const myStyles = {
  ...utils.formStyles,
  textbox: {
    normal: { color: 'white' }
  }
}

const loginFormOptions = {
  auto: 'placeholders',
  fields: {
    email: {
      placeholder: 'Email / Mobile',
      error: 'Specify a registered email or mobile'
    },
    password: {
      secureTextEntry: true,
      error: 'Specify password'
    }
  },
  stylesheet: myStyles
  // stylesheet: Form.stylesheet // utils.formStyles
}

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: {
        email: 'rsmoorthy@gmail.com',
        password: 'rsm123'
      }
    }
  }

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-log-in" style={{ color: tintColor }} />
  }

  handleSubmit = () => {
    const value = this._form.getValue()
    if (value) {
      this.state.value = value
      this.props.doLogin(value)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} barStyle="dark-content" />
        <Text style={{ fontFamily: 'serif', fontSize: 32, color: 'white' }}>HFO</Text>
        <View style={{ marginTop: 50, width: '80%' }}>
          <Form ref={c => (this._form = c)} type={LoginForm} value={this.state.value} options={loginFormOptions} />
          <Button title="Login" onPress={this.handleSubmit} />
        </View>
        {this.props.login.error !== '' && <Text style={{ fontSize: 22, color: 'red' }}>{this.props.login.error}</Text>}
        {this.props.login.inProgress === true && <ActivityIndicator size="large" color="#ffffff" />}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 50,
            marginBottom: 30,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <Button
            style={{ flex: 1, marginRight: 50 }}
            title="   Sign Up    "
            onPress={() => this.props.navigation.navigate('Signup')}
          />
          <Text style={{ flex: 0.2 }}> </Text>
          <Image style={{ flex: 0.5, height: 33, width: 135 }} source={require('../assets/signin_with_google.png')} />
        </View>
        <Image
          style={{ alignSelf: 'stretch', flex: 0.5, height: undefined, width: undefined }}
          source={require('../assets/airport1.jpg')}
          resizeMode="contain"
        />
        <View style={{ height: 30 }}>
          <Text> </Text>
        </View>
      </View>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login']), utils.mapDispatchToProps)(Login)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#55acee',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
