import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { View, StatusBar, StyleSheet } from 'react-native'
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

class DisplayList extends Component {
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
          <Body>
            <Title>Welcome</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.getPickups()}>
              <Icon name="md-refresh" />
            </Button>
          </Right>
        </Header>
        <StatusBar hidden={true} barStyle="dark-content" />
        <Content>
          <List>
            {pickups.length === 0 && (
              <ListItem>
                <Body>
                  <View>
                    <Text style={{ color: 'navyblue', fontSize: 96 }}>Welcome to HFO</Text>
                  </View>
                </Body>
              </ListItem>
            )}
            {pickups.map((pickup, index) => (
              <ListItem key={index}>
                <Body>
                  <View>
                    <Text style={{ fontSize: 28, color: 'darkblue' }}>{pickup.flight}</Text>
                    <Text style={{ fontSize: 48, color: 'darkblue' }}>{pickup.name}</Text>
                    <Text note style={{ color: 'green', fontStyle: 'italic' }}>
                      Receiver: {pickup.receiverName} {pickup.receiverMobile}
                    </Text>
                  </View>
                </Body>
                <Right>
                  <Text note style={{ color: '#e75480' }} />
                  <Text note style={{ color: '#e75480' }}>
                    Pickup {moment(pickup.pickupDate).format('Do-MMM  hh:mm')}
                  </Text>
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
  DisplayList
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
