import React, { Component } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { connect } from 'react-redux'
import * as utils from '../utils'
import moment from 'moment'

import { Container, Content, Icon, Thumbnail, Header, Left, Right, Body, Button } from 'native-base'
import CardComponent from './CardComponent'

class PassengerHome extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-home" style={{ color: tintColor }} />,
    drawerIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="menu" onPress={this.props.navigation.openDrawer} />
            </Button>
          </Left>
          <Body>
            <Text style={{ fontSize: 20, color: 'white' }}>HFO - My Itinerary</Text>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.getPickups()}>
              <Icon name="ios-refresh" />
            </Button>
          </Right>
        </Header>
        <Content>{this.props.pickups.map((pickup, index) => <CardComponent pickup={pickup} key={index} />)}</Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']), utils.mapDispatchToProps)(
  PassengerHome
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
})
