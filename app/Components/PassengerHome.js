import React, { Component } from 'react'
import { StyleSheet, ScrollView, FlatList } from 'react-native'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { connect } from 'react-redux'
import * as utils from '../utils'
import moment from 'moment'
import { Constants, MapView } from 'expo'
import OrangeMarker from '../assets/orange_marker.png'
import FlightMarker from '../assets/flight_marker.png'

import {
  Container,
  Content,
  Icon,
  Thumbnail,
  Header,
  View,
  Left,
  Right,
  Body,
  Text,
  Button,
  Card,
  CardItem,
  Alert,
  Toast
} from 'native-base'
import CardComponent from './CardComponent'
import PickupList, {
  ProfileInfo,
  ArrivalBay,
  FlightScheduleInfo,
  FlightStatus,
  CompleteTrip,
  PickupView
} from './PickupList'

class ItemView extends Component {
  constructor(props) {
    super(props)
    this.markers = []
    this.calloutShown = false
  }

  render() {
    const item = this.props.item
    const pickupId = item._id
    const fromPosition = JSON.parse(item.fromPosition)
    const toPosition = JSON.parse(item.toPosition)
    const flightPosition = item.position ? JSON.parse(item.position) : null
    const region = utils.getRegionForCoordinates([fromPosition, toPosition])
    return (
      <View style={{ flex: 1 }}>
        <Card>
          <View style={{ padding: 5, margin: 6, backgroundColor: '#F8F8F8' }}>
            <CardItem bordered>
              <FlightScheduleInfo style={{ flex: 1 }} item={item} />
            </CardItem>
            <CardItem bordered>
              <ArrivalBay style={{ flex: 1 }} item={item} />
            </CardItem>
            <CardItem bordered>
              <ProfileInfo
                style={{ flex: 1, paddingLeft: 5 }}
                item={{ ...item.receiver, receiverId: item.receiverId, item: item }}
                who="Receiver"
                navigation={this.props.navigation}
                login={this.props.login}
              />
            </CardItem>
            <CardItem bordered>
              <FlightStatus style={{ flex: 1, paddingLeft: 5 }} item={item} navigation={this.props.navigation} />
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
              <MapView
                style={{
                  alignSelf: 'stretch',
                  borderColor: '#cccccc',
                  borderWidth: 0.5,
                  height: 400,
                  width: '90%'
                }}
                onRegionChangeComplete={() => {
                  // console.log('on region change', this.calloutShown, this.markers)
                  /*
                    if (!this.calloutShown) {
                      console.log(this.markers)
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
                {item.position &&
                  item.position.length && (
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
    )
  }
}

class PassengerHome extends Component {
  state = {
    scope: 'current',
    title: 'HFO - My Itinerary',
    backgroundColor: '#4050b5'
  }
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-home" style={{ color: tintColor }} />,
    drawerIcon: ({ tintColor }) => <Icon name="ios-home" style={{ color: tintColor }} />,
    drawerLabel: 'Home',
    header: null
  }

  componentWillMount() {
    this.props.dispatch({ type: 'PICKUP_RESET' })
    this.props.getPickups(this.state.scope)
  }

  isRefreshing() {
    if (this.props.meta.pickupListInProgress === undefined) return false
    return this.props.meta.pickupListInProgress
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header
          style={{
            backgroundColor: this.state.backgroundColor,
            paddingLeft: 10,
            paddingTop: getStatusBarHeight(),
            height: 54 + getStatusBarHeight()
          }}>
          <Left>
            <Button transparent>
              <Icon name="menu" onPress={this.props.navigation.openDrawer} />
            </Button>
          </Left>
          <Body>
            <Text style={{ fontSize: 20, color: 'white' }}>{this.state.title}</Text>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.getPickups(this.state.scope)}>
              <Icon name="md-refresh" />
            </Button>
          </Right>
        </Header>
        <Content>
          <FlatList
            data={this.props.pickups}
            refreshing={this.isRefreshing()}
            onRefresh={() => this.props.getPickups(this.state.scope)}
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={() => (
              <View style={{ flex: 1, width: '100%', alignItems: 'stretch', justifyContent: 'center' }}>
                <Card>
                  <CardItem bordered>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: 'gray', marginTop: 10, fontStyle: 'italic' }}>No Pickup List</Text>
                    </View>
                  </CardItem>
                  <CardItem header bordered>
                    <Text>Request Pickup</Text>
                  </CardItem>
                  <CardItem bordered>
                    <Body>
                      <Text>
                        You can request for a pickup at Bengaluru airport. You will be notified when a receiver is
                        assigned to you
                      </Text>
                    </Body>
                  </CardItem>
                  <CardItem bordered>
                    <View style={{ width: '100%', justifyContent: 'center' }}>
                      <Button
                        transparent
                        title="Request Pickup"
                        onPress={() => this.props.navigation.navigate('RequestPickup')}
                        style={{
                          alignSelf: 'stretch',
                          justifyContent: 'center',
                          borderColor: 'brown',
                          borderWidth: 1
                        }}>
                        <Text>Request Pickup</Text>
                      </Button>
                    </View>
                  </CardItem>
                </Card>
              </View>
            )}
            renderItem={({ item, index, separators }) => <ItemView {...this.props} key={index} item={item} />}
          />
        </Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']), utils.mapDispatchToProps)(
  PassengerHome
)

class _PastPassengerList extends Component {
  state = {
    scope: 'past',
    title: 'Past Pickups',
    backgroundColor: 'green'
  }

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-car-outline" style={{ color: tintColor }} />,
    drawerIcon: ({ tintColor }) => <Icon name="ios-car-outline" style={{ color: tintColor }} />,
    drawerLabel: 'Past Pickups',
    header: null
  }
}

export const PastPassengerList = connect(
  utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']),
  utils.mapDispatchToProps
)(_PastPassengerList)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
})
