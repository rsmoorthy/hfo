import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { View, Text, StatusBar, StyleSheet, Button } from 'react-native'
import moment from 'moment'

import Icon from 'react-native-vector-icons/dist/Ionicons'

class DisplayList extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
    header: null
  }

  state = {
    tm: new Date()
  }

  componentWillMount() {
    this.props.getPickups('display')
    this.timer1 = setInterval(() => {
      this.props.getPickups('display')
    }, 30000)
    this.timer2 = setInterval(() => {
      this.setState({ tm: new Date() })
    }, 1000)
  }

  componentWillUnmount() {
    if (this.timer1) clearInterval(this.timer1)
    if (this.timer2) clearInterval(this.timer2)
  }

  render() {
    const pickups = this.props.pickups
    return (
      <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: 'white' }}>
        <View
          style={{
            backgroundColor: '#55acee',
            height: 40,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center'
          }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 20 }}>
            <Icon style={{ fontSize: 20, color: 'white' }} name="ios-log-out" onPress={() => this.props.doLogout()} />
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 24 }}>HFO</Text>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 20 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>{moment(this.state.tm).format('HH:mm:ss')}</Text>
          </View>
        </View>

        {pickups.length === 0 && (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'blue', fontSize: 112, padding: 20 }}>HFO welcomes you!</Text>
          </View>
        )}
        {pickups.map((pickup, index) => (
          <View
            key={index}
            style={{ padding: 10, borderBottomColor: 'gray', borderBottomWidth: 0.5, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 36 }}>{pickup.flight}</Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 36 }}>{pickup.arrivalBay}</Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 22 }}>{moment(pickup.pickupDate).format('DD MMM  HH:mm')}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 22 }}>Welcomes</Text>
            <Text style={{ fontSize: 112, color: 'darkblue' }}>{pickup.name}</Text>
          </View>
        ))}
      </View>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']), utils.mapDispatchToProps)(
  DisplayList
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
