import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { View, Text, StyleSheet } from 'react-native'

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
  StyleProvider
} from 'native-base'
import { getStatusBarHeight } from 'react-native-status-bar-height'
// import getTheme from '../../native-base-theme/components'
// import material from '../../native-base-theme/variables/material'
// import platform from '../../native-base-theme/variables/platform'

class FlightArrivals extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-plane" style={{ color: tintColor }} />
  }

  componentWillMount() {
    console.log('Calling getCurrentFlights')
    this.props.getCurrentFlights()
  }

  render() {
    const flights = this.props.currentFlights
    const getCurrentFlights = this.props.getCurrentFlights
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Icon name="menu" />
          </Left>
          <Body>
            <Title>Flights Arrival</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.getCurrentFlights()}>
              <Icon name="ios-refresh" />
            </Button>
            <Button transparent onPress={() => this.props.doLogout()}>
              <Icon name="ios-log-out" />
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            {flights.map((flight, index) => (
              <ListItem key={index}>
                <Body>
                  <View>
                    <Text style={{ fontSize: 20, color: 'darkblue' }}>{flight.flight}</Text>
                    <Text note>{flight.note}</Text>
                  </View>
                </Body>
                <Right>
                  <Text>{flight.arrivalTime}</Text>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
            ))}
          </List>
          <Button warning onPress={() => this.props.getCurrentFlights()}>
            <Text> Refresh </Text>
          </Button>
        </Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'currentFlights']), utils.mapDispatchToProps)(
  FlightArrivals
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
