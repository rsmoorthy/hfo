import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { View, StyleSheet } from 'react-native'
import moment from 'moment'

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
  Badge
} from 'native-base'
import { getStatusBarHeight } from 'react-native-status-bar-height'
// import getTheme from '../../native-base-theme/components'
// import material from '../../native-base-theme/variables/material'
// import platform from '../../native-base-theme/variables/platform'

class PickupList extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
    header: null
  }

  componentWillMount() {
    this.props.dispatch({ type: 'PICKUP_RESET' })
    this.props.getPickups()
  }

  render() {
    const pickups = this.props.pickups
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>Pickup List</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.push('PickupForm')}>
              <Icon name="ios-add" />
            </Button>
            <Button transparent onPress={() => this.props.getPickups()}>
              <Icon name="ios-refresh" />
            </Button>
            <Button transparent onPress={() => this.props.doLogout()}>
              <Icon name="ios-log-out" />
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            {pickups.length === 0 && (
              <ListItem>
                <Body>
                  <View>
                    <Text style={{ color: 'gray', fontStyle: 'italic' }}>No Pickup List</Text>
                  </View>
                </Body>
              </ListItem>
            )}
            {pickups.map((pickup, index) => (
              <ListItem key={index} onPress={() => this.props.navigation.push('PickupForm', { pickup: pickup })}>
                <Body>
                  <View>
                    <Text style={{ fontSize: 20, color: 'darkblue' }}>
                      {pickup.flight} {pickup.name}
                    </Text>
                    <Text note style={{ color: 'gray' }}>
                      {pickup.airport}
                    </Text>
                    <Text note style={{ color: 'green', fontStyle: 'italic' }}>
                      Receiver: {pickup.receiverName} {pickup.receiverMobile}
                    </Text>
                  </View>
                </Body>
                <Right>
                  <Text note style={{ color: '#e75480' }}>
                    {moment(pickup.pickupDate).format('YYYY-MM-DD')} {pickup.pickupTime}
                  </Text>
                  <Text note>{pickup.completed}</Text>
                </Right>
              </ListItem>
            ))}
          </List>
        </Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']), utils.mapDispatchToProps)(
  PickupList
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
