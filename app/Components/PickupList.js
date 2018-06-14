import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { StyleSheet, FlatList, TouchableOpacity, TouchableHighlight, Image } from 'react-native'
import moment from 'moment'
import { UserRatingInfo } from './UserList'

import {
  Container,
  View,
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
  Badge,
  Card,
  CardItem,
  Toast
} from 'native-base'
import { getStatusBarHeight } from 'react-native-status-bar-height'
// import getTheme from '../../native-base-theme/components'
// import material from '../../native-base-theme/variables/material'
// import platform from '../../native-base-theme/variables/platform'

const EmailInfo = ({ item }) => (
  <View>
    {item.email && (
      <View style={{ flexDirection: 'row' }}>
        <Icon name="ios-mail-outline" style={{ fontSize: 16 }} />
        <Text style={{ fontSize: 11, marginLeft: 5, color: 'green' }}>{item.email}</Text>
      </View>
    )}
  </View>
)

const MobileInfo = ({ item }) => (
  <View>
    {item.mobile && (
      <View style={{ flexDirection: 'row' }}>
        <Icon name="ios-phone-portrait" style={{ fontSize: 16 }} />
        <Text style={{ fontSize: 11, marginLeft: 5, color: 'green' }}>{item.mobile}</Text>
      </View>
    )}
  </View>
)

const ProfileInfo = ({ style, item, who, navigation }) => {
  return (
    <View style={style}>
      <Text style={{ fontSize: 10, color: 'gray' }}>{who}</Text>
      {who === 'Receiver' && (item.receiverId === null || item.receiverId === undefined) ? (
        <View>
          <Text style={{ fontSize: 16, color: 'brown' }}>Not assigned</Text>
          <Button
            transparent
            small
            title="Assign Receiver"
            onPress={() => navigation.push('AssignReceiverModal', { pickup: item.item })}
            style={{ borderColor: 'brown', borderWidth: 1, padding: 2 }}>
            <Text>Assign Receiver</Text>
          </Button>
        </View>
      ) : (
        <View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Image
                source={item.photo && item.photo.length ? { uri: item.photo } : require('../assets/user1.jpg')}
                style={{ width: 40, height: 40, borderRadius: 37.5 }}
              />
            </View>
            {who !== 'Receiver' && (
              <View style={{ flex: 1.5 }}>
                <Text style={{ fontSize: 14 }}>{item.name}</Text>
              </View>
            )}
            {who === 'Receiver' && <UserRatingInfo style={{ flex: 3 }} item={item} />}
          </View>
          <View>
            {who === 'Receiver' && <Text style={{ fontSize: 14 }}>{item.name}</Text>}
            <EmailInfo item={item} />
            <MobileInfo item={item} />
          </View>
        </View>
      )}
    </View>
  )
}

/*
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, color: 'gray' }}>
                Rating {'  '}
                <Text style={{ fontSize: 13 }}>{item.rating ? item.rating : 'n/a'}</Text>
              </Text>
              <Text style={{ fontSize: 10, color: 'gray' }}>
                Pickups {'  '}
                <Text style={{ fontSize: 13 }}>{item.pickups ? item.pickups : '0'}</Text>
              </Text>
              <Text style={{ fontSize: 10, color: 'gray' }}>
                Last seen {'  '}
                <Text>{item.lastSeen ? utils.lastSeen(item.lastSeen) : 'never'}</Text>
              </Text>
            </View>
            */
const FlightScheduleInfo = ({ item, style }) => (
  <View style={style}>
    <View style={{ flexDirection: 'column' }}>
      <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 22.53, color: 'darkblue' }}>
          {item.carrierName ? item.carrierName : ''}
          {'  '}
          {item.flight}
          {'    '}
        </Text>
        <Text style={{ fontSize: 13, color: 'green' }}>{moment(item.pickupDate).format('ddd Do MMM YYYY')}</Text>
      </View>
      <View
        style={{
          borderColor: 'red',
          borderWidth: 0,
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }}>
        <View style={{ flex: 1, borderColor: 'blue', borderWidth: 0, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 16, color: 'black' }}>
            {item.fromCity} ({item.fromCode})
          </Text>
          <Text style={{ fontSize: 10, color: 'gray' }}>{item.fromAirport.substr(0, 15) + '...'}</Text>
          <Text style={{ fontSize: 13, color: '#333333' }}>
            {moment(item.scheduledDeparture).format('Do MMM HH:mm')}
          </Text>
        </View>
        <View style={{ flex: 0.2, alignItems: 'flex-start' }}>
          <Icon name="ios-arrow-round-forward" />
        </View>
        <View style={{ flex: 1, borderColor: 'blue', borderWidth: 0, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 16, color: 'black' }}>
            {item.toCity} ({item.toCode})
          </Text>
          <Text style={{ fontSize: 10, color: 'gray' }}>{item.toAirport.substr(0, 15) + '...'}</Text>
          <Text style={{ fontSize: 13, color: '#333333' }}>{moment(item.scheduledArrival).format('Do MMM HH:mm')}</Text>
        </View>
      </View>
    </View>
  </View>
)

const PickupMetaInfo = ({ item, style }) => (
  <View style={style}>
    <Text style={{ fontSize: 10, color: 'gray' }}> HFO Status: </Text>
    <Text style={{ fontSize: 13, borderWidth: 0, borderColor: 'pink', padding: 2 }}>{item.status}New</Text>
    <Text style={{ fontSize: 10, color: 'gray' }}> Flight Status: </Text>
    <Text style={{ fontSize: 13, borderWidth: 0, borderColor: 'pink', padding: 2 }}>Not Departed</Text>
    <Text style={{ fontSize: 10, color: 'gray' }}> ETA: </Text>
    <Text style={{ fontSize: 13, borderWidth: 0, borderColor: 'pink', padding: 2 }}>16:30</Text>
  </View>
)

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
    // setTimeout(() => Toast.show({ text: 'Wrong Password', buttonText: 'Ok', type: 'warning', duration: 10000 }), 2000)
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
          <FlatList
            data={this.props.pickups}
            refreshing={this.isRefreshing()}
            onRefresh={() => this.props.getPickups()}
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={() => (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'gray', marginTop: 10, fontStyle: 'italic' }}>No Pickup List</Text>
              </View>
            )}
            renderItem={({ item, index, separators }) => (
              <TouchableHighlight
                onPress={() => this.props.navigation.push('PickupView', { pickup: item })}
                onShowUnderlay={separators.highlight}
                onHideUnderlay={separators.unhighlight}>
                <View style={{ padding: 5, margin: 6, backgroundColor: '#F8F8F8' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <FlightScheduleInfo style={{ flex: 3 }} item={item} />
                    <PickupMetaInfo
                      style={{ flex: 1.5, borderLeftColor: 'gray', borderLeftWidth: 0.2, paddingLeft: 5 }}
                      item={item}
                    />
                  </View>
                  <View style={{ borderTopColor: 'gray', borderTopWidth: 0.2, paddingTop: 5 }}>
                    <View style={{ flexDirection: 'row' }}>
                      {this.props.login.role !== 'Passenger' && (
                        <ProfileInfo
                          style={{ flex: 2, borderRightWidth: 0.2, borderRightColor: 'gray', paddingRight: 10 }}
                          item={{ ...item, receiverId: item.receiveId, item: item }}
                          navigation={this.props.navigation}
                          who="Passenger"
                        />
                      )}
                      {this.props.login.role !== 'Receiver' && (
                        <ProfileInfo
                          style={{ flex: 3, paddingLeft: 5 }}
                          item={{ ...item.receiver, receiverId: item.receiverId, item: item }}
                          navigation={this.props.navigation}
                          who="Receiver"
                        />
                      )}
                    </View>
                  </View>
                </View>
              </TouchableHighlight>
            )}
          />
          {/*
          <View style={{ marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5 }}>
            {this.props.pickups.map((item, index) => (
              <Card>
                <CardItem>
                  <TouchableHighlight onPress={() => this.props.navigation.push('PickupForm', { pickup: item })}>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingTop: 10,
                        marginTop: 1,
                        marginBottom: 1,
                        paddingBottom: 10
                      }}>
                      <Text>One {item._id}</Text>
                    </View>
                  </TouchableHighlight>
                </CardItem>
              </Card>
            ))}
            <View style={{ marginBottom: 100 }} />
            <Card
              dataArray={this.props.pickups}
              renderRow={(item, index) => (
                <CardItem bordered>
                  <TouchableHighlight onPress={() => this.props.navigation.push('PickupForm', { pickup: item })}>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingTop: 10,
                        marginTop: 1,
                        marginBottom: 1,
                        paddingBottom: 10
                      }}>
                      <Text style={{ height: 100 }}>One {item._id}</Text>
                    </View>
                  </TouchableHighlight>
                </CardItem>
              )}
            />
          </View>
          */}
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

class _PickupView extends Component {
  static navigationOptions = {
    header: null
  }
  state = {
    pickup: null
  }

  componentWillMount() {
    this.setState({ pickup: this.props.navigation.getParam('pickup', null) })
  }

  isRefreshing() {
    if (this.props.meta.pickupListInProgress === undefined) return false
    return this.props.meta.pickupListInProgress
  }

  render() {
    const pickupId = this.state.pickup ? this.state.pickup._id : undefined
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="ios-arrow-dropleft" onPress={() => this.props.navigation.goBack()} />
            </Button>
          </Left>
          <Body>
            <Title>Pickup View</Title>
          </Body>
        </Header>
        <Content>
          <FlatList
            data={[this.state.pickup]}
            refreshing={this.isRefreshing()}
            onRefresh={() =>
              this.props.getPickups(pickupId, pickup => {
                this.setState({ pickup: pickup })
              })
            }
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={() => (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'gray', marginTop: 10, fontStyle: 'italic' }}>No Pickup List</Text>
              </View>
            )}
            renderItem={({ item, index, separators }) => (
              <Card>
                <View style={{ padding: 5, margin: 6, backgroundColor: '#F8F8F8' }}>
                  <CardItem bordered>
                    <FlightScheduleInfo style={{ flex: 1 }} item={item} />
                  </CardItem>
                  <CardItem bordered>
                    <PickupMetaInfo style={{ flex: 1 }} item={item} />
                  </CardItem>
                  <CardItem bordered>
                    <ProfileInfo
                      style={{ flex: 1, borderRightWidth: 0, borderRightColor: 'gray', paddingRight: 10 }}
                      item={{ ...item, receiverId: item.receiveId, item: item }}
                      who="Passenger"
                    />
                  </CardItem>
                  <CardItem bordered>
                    <ProfileInfo
                      style={{ flex: 1, paddingLeft: 5 }}
                      item={{ ...item.receiver, receiverId: item.receiverId, item: item }}
                      who="Receiver"
                    />
                  </CardItem>
                </View>
              </Card>
            )}
          />
        </Content>
      </Container>
    )
  }
}

export const PickupView = connect(utils.mapStateToProps('hfo', ['login', 'meta', 'pickups']), utils.mapDispatchToProps)(
  _PickupView
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
