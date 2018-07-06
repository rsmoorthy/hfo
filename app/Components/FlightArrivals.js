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
    tabBarIcon: ({ tintColor }) => <Icon name="ios-plane" style={{ color: tintColor }} />,
    drawerIcon: ({ tintColor }) => <Icon name="ios-plane" style={{ color: tintColor }} />
  }

  componentWillMount() {
    this.props.getCurrentFlights()
  }

  render() {
    const flights = this.props.currentFlights
    const getCurrentFlights = this.props.getCurrentFlights
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="menu" onPress={this.props.navigation.openDrawer} />
            </Button>
          </Left>
          <Body>
            <Title>Flights Arrival</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.getCurrentFlights()}>
              <Icon name="md-refresh" />
            </Button>
          </Right>
        </Header>
        <Content style={{ backgroundColor: 'white' }}>
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
                </Right>
              </ListItem>
            ))}
          </List>
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
