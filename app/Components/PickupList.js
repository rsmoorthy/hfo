import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { View, StyleSheet, FlatList, TouchableOpacity, TouchableHighlight } from 'react-native'
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
    drawerIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
    drawerName: 'Pickups',
    header: null
  }

  componentWillMount() {
    this.props.dispatch({ type: 'PICKUP_RESET' })
    this.props.getPickups()
  }

  isRefreshing() {
    if (this.props.meta.pickupListInProgress === undefined) return false
    return this.props.meta.pickupListInProgress
  }

  render() {
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="menu" onPress={this.props.navigation.openDrawer} />
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
          <View style={{ flex: 1, backgroundColor: '#EAE8EF' }}>
            <FlatList
              data={this.props.pickups}
              refreshing={this.isRefreshing()}
              onRefresh={() => this.props.getPickups()}
              keyExtractor={(item, index) => item._id}
              ListEmptyComponent={() => (
                <View>
                  <Text style={{ color: 'gray', fontStyle: 'italic' }}>No Pickup List</Text>
                </View>
              )}
              renderItem={({ item, index, separators }) => (
                <TouchableHighlight
                  onPress={() => this.props.navigation.push('PickupForm', { pickup: item })}
                  onShowUnderlay={separators.highlight}
                  onHideUnderlay={separators.unhighlight}>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingTop: 10,
                      marginTop: 1,
                      marginBottom: 1,
                      paddingBottom: 10,
                      backgroundColor: index % 2 === 0 ? '#F8F8F8' : '#F8F8F8'
                    }}>
                    <Text style={{ height: 100 }}>One</Text>
                  </View>
                </TouchableHighlight>
              )}
            />
          </View>
          {/*
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
                    {pickup.completed !== 'Yes' && (
                      <Button small danger onPress={() => this.props.doCompletePickup(pickup)}>
                        <Text>Complete Pickup</Text>
                      </Button>
                    )}
                    {pickup.completed === 'Yes' && (
                      <Text note style={{ color: '#e75480', fontStyle: 'italic' }}>
                        Completed at {moment(pickup.receiverComplete).format('Do-MMM hh:mm')}
                      </Text>
                    )}
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
            */}
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
