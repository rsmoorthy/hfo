import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { StyleSheet, FlatList, TouchableOpacity, TouchableHighlight, Image, Alert } from 'react-native'
import moment from 'moment'
import { UserRatingInfo } from './UserList'
import { Constants, MapView, Marker } from 'expo'
import OrangeMarker from '../assets/orange_marker.png'
import FlightMarker from '../assets/flight_marker.png'

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

export const ProfileInfo = ({ style, item, who, navigation }) => {
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
              <TouchableOpacity
                onPress={() => {
                  if (item.photo && item.photo.length) navigation.push('GetPhotoModal', { image: item.photo })
                }}>
                <Image
                  source={item.photo && item.photo.length ? { uri: item.photo } : require('../assets/user1.jpg')}
                  style={{ width: 40, height: 40, borderRadius: 37.5 }}
                />
              </TouchableOpacity>
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

export const FlightScheduleInfo = ({ item, style }) => (
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
          <Icon name="md-arrow-round-forward" />
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
    <Text style={{ fontSize: 10, color: 'gray' }}> Pickup Status: </Text>
    <Text style={{ fontSize: 13, borderWidth: 0, borderColor: 'pink', padding: 2 }}>{item.status}</Text>
    <Text style={{ fontSize: 10, color: 'gray' }}> Flight Status: </Text>
    <Text style={{ fontSize: 13, borderWidth: 0, borderColor: 'pink', padding: 2 }}>
      {item.flightStatus ? item.flightStatus : 'Not Departed'}
    </Text>
    <Text style={{ fontSize: 10, color: 'gray' }}>
      {item.flightProgress && item.flightProgress.toString() === '100'
        ? 'Arrival Time'
        : 'Flight ETA' + (item.flightProgress ? '(Prog %)' : '')}
    </Text>
    <Text style={{ fontSize: 13, borderWidth: 0, borderColor: 'pink', padding: 2 }}>
      {item.etaArrival ? moment(item.etaArrival).format('HH:mm') : moment(item.scheduledArrival).format('HH:mm')}
      {'  '}
      {item.flightProgress ? item.flightProgess : ''}
    </Text>
  </View>
)

export const FlightStatus = ({ item, style }) => (
  <View style={style}>
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1, paddingRight: 20 }}>
        <Text style={{ fontSize: 10, color: 'gray' }}> Flight Status: </Text>
        <Text style={{ fontSize: 13, padding: 2 }}>{item.flightStatus ? item.flightStatus : 'Not Departed'}</Text>
        <Text style={{ fontSize: 10, color: 'gray' }}> Actual Departure: </Text>
        <Text style={{ fontSize: 13, padding: 2 }}>
          {' '}
          {item.actualDeparture ? moment(item.actualDeparture).format('HH:mm') : ' '}{' '}
        </Text>
        <Text style={{ fontSize: 10, color: 'gray' }}> Exp Departure: </Text>
        <Text style={{ fontSize: 13, padding: 2 }}> {'  '} </Text>
        <Text style={{ fontSize: 10, color: 'gray' }}> Dep Delay: </Text>
        <Text style={{ fontSize: 13, padding: 2 }}> {item.departureDelay ? item.departeDelay : ' '} </Text>
      </View>
      <View style={{ flex: 1, paddingLeft: 20 }}>
        <Text style={{ fontSize: 10, color: 'gray' }}> Flight Progress: </Text>
        <Text style={{ fontSize: 13, padding: 2 }}> {item.flightProgress ? item.flightProgress + ' %' : 'n/a'} </Text>
        <Text style={{ fontSize: 10, color: 'gray' }}> Actual Arrival: </Text>
        <Text style={{ fontSize: 13, padding: 2 }}>
          {' '}
          {item.actualArrival ? moment(item.actualArrival).format('HH:mm') : ' '}{' '}
        </Text>
        <Text style={{ fontSize: 10, color: 'gray' }}> Exp Arrival: </Text>
        <Text style={{ fontSize: 13, padding: 2 }}>
          {' '}
          {item.etaArrival ? moment(item.etaArrival).format('HH:mm') : ' '}{' '}
        </Text>
        <Text style={{ fontSize: 10, color: 'gray' }}> Arr Delay: </Text>
        <Text style={{ fontSize: 13, padding: 2 }}> {item.arrivalDelay ? item.arrivallay : ' '} </Text>
      </View>
    </View>
  </View>
)

export const ArrivalBay = ({ item, style }) => (
  <View style={style}>
    <View style={{ flexDirection: 'row' }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingRight: 20
        }}>
        <Text style={{ fontSize: 10, color: 'gray' }}> Display Screen No: </Text>
      </View>
      <View style={{ flex: 1, paddingLeft: 20 }}>
        <Text
          style={{
            fontSize: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#009adf',
            width: 40,
            height: 40,
            color: 'white',
            borderRadius: 22,
            padding: 2
          }}>
          {' '}
          {item.arrivalBay ? item.arrivalBay : ' '}{' '}
        </Text>
      </View>
    </View>
  </View>
)

const FeedbackShow = ({ item, login, style }) => (
  <View style={style}>
    {login.role !== 'Passenger' && (
      <View style={{ flexDirection: 'row' }}>
        <View
          style={{
            flex: 0.2,
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: 20
          }}>
          <Text style={{ fontSize: 10, color: 'gray' }}> Rating: </Text>
          <Text style={{ fontSize: 13 }}> {item.rating} </Text>
        </View>
        <View style={{ flex: 1, paddingLeft: 20 }}>
          <Text style={{ fontSize: 10, color: 'gray' }}> Feedback: </Text>
          <Text style={{ fontSize: 13 }}> {item.feedback ? item.feedback : ' '} </Text>
        </View>
      </View>
    )}
  </View>
)

export const CompleteTrip = props => (
  <View style={props.style}>
    {(props.login.role === 'Receiver' || props.login.role === 'Passenger' || props.login.role === 'Admin') &&
      props.item.status !== 'Completed' && (
        <View>
          <Button
            warning
            style={{ alignSelf: 'stretch' }}
            small
            title="Complete Trip"
            onPress={() => {
              if (props.login.role === 'Passenger') props.navigation.push('FeedbackModal', { pickup: props.item })
              if (props.login.role === 'Receiver')
                props.doUpdatePickup(
                  {
                    _id: props.item._id,
                    status: 'Completed',
                    completedDate: new Date()
                  },
                  (err, message) => {
                    if (err) Alert.alert('Failed to Update', err)
                    else {
                      Toast.show({
                        text: 'Completed Successfully',
                        buttonText: 'Ok',
                        type: 'success',
                        duration: 5000
                      })
                    }
                  }
                )
            }}
            style={{
              alignSelf: 'stretch',
              justifyContent: 'center',
              borderColor: 'brown',
              borderWidth: 1,
              padding: 2
            }}>
            <Text>Complete Trip</Text>
          </Button>
        </View>
      )}
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
            {(this.props.login.role === 'Agent' || this.props.login.role === 'Admin') && (
              <Button transparent onPress={() => this.props.navigation.push('PickupForm')}>
                <Icon name="md-add-circle" />
              </Button>
            )}
            <Button transparent onPress={() => this.props.getPickups()}>
              <Icon name="md-refresh" />
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
                    <CompleteTrip
                      style={{
                        alignSelf: 'stretch',
                        width: '100%',
                        borderTopColor: 'gray',
                        borderTopWidth: 0.2,
                        paddingTop: 5
                      }}
                      {...this.props}
                      item={item}
                    />
                    <FeedbackShow
                      style={{
                        alignSelf: 'stretch',
                        width: '100%',
                        borderTopColor: 'gray',
                        borderTopWidth: 0.2,
                        paddingTop: 5
                      }}
                      {...this.props}
                      item={item}
                    />
                  </View>
                </View>
              </TouchableHighlight>
            )}
          />
        </Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']), utils.mapDispatchToProps)(
  PickupList
)

class _PickupView extends Component {
  constructor(props) {
    super(props)
    this.markers = []
    this.calloutShown = false
  }
  static navigationOptions = {
    header: null
  }
  state = {
    pickups: []
  }

  componentWillMount() {
    this.setState({ pickups: [this.props.navigation.getParam('pickup', null)] })
  }

  isRefreshing() {
    if (this.props.meta.pickupListInProgress === undefined) return false
    return this.props.meta.pickupListInProgress
  }

  render() {
    const pickupId = this.state.pickups.length ? this.state.pickups[0]._id : undefined
    const fromPosition = JSON.parse(this.state.pickups[0].fromPosition)
    const toPosition = JSON.parse(this.state.pickups[0].toPosition)
    const flightPosition = this.state.pickups[0].position ? JSON.parse(this.state.pickups[0].position) : null
    const region = utils.getRegionForCoordinates([fromPosition, toPosition])
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="md-arrow-back" onPress={() => this.props.navigation.goBack()} />
            </Button>
          </Left>
          <Body>
            <Title>Pickup View</Title>
          </Body>
          <Right>
            <Button
              transparent
              onPress={() =>
                pickupId &&
                this.props.getPickups(pickupId, pickup => {
                  this.setState({ pickups: [pickup] })
                })
              }>
              <Icon name="md-refresh" />
            </Button>
          </Right>
        </Header>
        <Content>
          <FlatList
            data={this.state.pickups}
            refreshing={this.isRefreshing()}
            onRefresh={() =>
              this.props.getPickups(pickupId, pickup => {
                this.setState({ pickups: [pickup] })
              })
            }
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={() => (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'gray', marginTop: 10, fontStyle: 'italic' }}>No Pickup List</Text>
              </View>
            )}
            renderItem={({ item, index, separators }) => (
              <View style={{ flex: 1 }}>
                <Card>
                  <View style={{ padding: 5, margin: 6, backgroundColor: '#F8F8F8' }}>
                    <CardItem bordered>
                      <FlightScheduleInfo style={{ flex: 1 }} item={item} />
                    </CardItem>
                    <CardItem bordered>
                      <PickupMetaInfo style={{ flex: 1 }} item={item} />
                    </CardItem>
                    <CardItem bordered>
                      <ArrivalBay style={{ flex: 1 }} item={item} />
                    </CardItem>
                    <CardItem bordered>
                      <ProfileInfo
                        style={{ flex: 1, borderRightWidth: 0, borderRightColor: 'gray', paddingRight: 10 }}
                        item={{ ...item, receiverId: item.receiveId, item: item }}
                        who="Passenger"
                        navigation={this.props.navigation}
                      />
                    </CardItem>
                    <CardItem bordered>
                      <ProfileInfo
                        style={{ flex: 1, paddingLeft: 5 }}
                        item={{ ...item.receiver, receiverId: item.receiverId, item: item }}
                        who="Receiver"
                        navigation={this.props.navigation}
                      />
                    </CardItem>
                    <CardItem bordered>
                      <FlightStatus
                        style={{ flex: 1, paddingLeft: 5 }}
                        item={item}
                        navigation={this.props.navigation}
                      />
                    </CardItem>
                    <CardItem bordered>
                      <CompleteTrip
                        style={{
                          alignSelf: 'stretch',
                          width: '100%',
                          paddingTop: 5
                        }}
                        {...this.props}
                        item={item}
                      />
                    </CardItem>
                    <CardItem bordered>
                      <FeedbackShow
                        style={{
                          alignSelf: 'stretch',
                          width: '100%',
                          paddingTop: 5
                        }}
                        {...this.props}
                        item={item}
                      />
                    </CardItem>
                    <CardItem bordered>
                      <MapView
                        style={{
                          alignSelf: 'stretch',
                          borderColor: '#cccccc',
                          borderWidth: 0.5,
                          height: 400,
                          width: '90%'
                        }}
                        onRegionChangeComplete={() => {
                          /*
                          console.log('on region change list', typeof this.markers)
                          if (!this.calloutShown) {
                            this.markers.forEach(m => m.showCallout())
                            this.calloutShown = true
                          }
                          */
                        }}
                        initialRegion={region}>
                        <MapView.Marker
                          ref={marker => this.markers.push(marker)}
                          coordinate={fromPosition}
                          title={item.fromCity}
                          image={OrangeMarker}
                          description={item.fromAirport.substr(0, 10) + '...'}
                        />
                        <MapView.Marker
                          ref={marker => this.markers.push(marker)}
                          coordinate={toPosition}
                          title={item.toCity}
                          image={OrangeMarker}
                          description={item.toAirport.substr(0, 10) + '...'}
                        />
                        <MapView.Polyline
                          strokeColor="#FF3F5D"
                          strokeWidth={1}
                          coordinates={[fromPosition, toPosition]}
                          geodesic={true}
                        />
                        {flightPosition && (
                          <MapView.Marker
                            ref={marker => this.markers.push(marker)}
                            coordinate={flightPosition}
                            title={item.flight}
                            image={FlightMarker}
                            description={item.carrierName + ' ' + item.flight}
                          />
                        )}
                      </MapView>
                    </CardItem>
                  </View>
                </Card>
              </View>
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
