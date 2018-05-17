import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, Dimensions, FlatList } from 'react-native'
import moment from 'moment'

import {
  Container,
  Content,
  Icon,
  Header,
  Left,
  Body,
  Right,
  Segment,
  Button,
  List,
  ListItem,
  Thumbnail
} from 'native-base'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import mci from 'react-native-vector-icons/MaterialCommunityIcons'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { connect } from 'react-redux'
import * as utils from '../utils'

import CardComponent from './CardComponent'
var { height, width } = Dimensions.get('window')

var images = [
  require('../assets/1.jpg'),
  require('../assets/2.jpg'),
  require('../assets/3.jpg'),
  require('../assets/avatar1.png'),
  require('../assets/7.jpg')
]

class Profile extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="person" style={{ color: tintColor }} />
  }

  constructor(props) {
    super(props)

    this.state = {
      activeIndex: 0
    }
  }

  segmentClicked(index) {
    this.setState({
      activeIndex: index
    })
  }
  checkActive = index => {
    if (this.state.activeIndex !== index) {
      return { color: 'grey' }
    } else {
      return {}
    }
  }

  renderSectionOne() {
    return images.map((image, index) => {
      return (
        <View
          key={index}
          style={[
            { width: width / 3 },
            { height: width / 3 },
            { marginBottom: 2 },
            index % 3 !== 0 ? { paddingLeft: 2 } : { paddingLeft: 0 }
          ]}>
          <Image
            style={{
              flex: 1,
              alignSelf: 'stretch',
              width: undefined,
              height: undefined
            }}
            source={image}
          />
        </View>
      )
    })
  }

  renderSection() {
    if (this.state.activeIndex === 0) {
      // <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{this.renderSectionOne()}</View>
      return (
        <View>
          <List>
            {this.props.notifications.length === 0 && (
              <ListItem>
                <Left>
                  <Icon name="ios-notifications" />
                </Left>
                <Body>
                  <Text style={{ fontStyle: 'italic', color: 'gray' }}>No Notifications</Text>
                </Body>
              </ListItem>
            )}
            {this.props.notifications.map((notification, index) => (
              <ListItem icon key={index}>
                <Left>
                  <Icon name="ios-notifications" />
                </Left>
                <Body>
                  <Text style={{ fontSize: 20, color: 'darkblue' }}>{notification.title}</Text>
                  <Text note>{notification.body}</Text>
                </Body>
                <Right>
                  <Text>{moment(notification.arrivalTime).format('YYYY-MM-DD hh:mm')}</Text>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
            ))}
          </List>
        </View>
      )
    } else if (this.state.activeIndex === 1) {
      const pickups = [
        {
          passenger: 'Scott Smith',
          destination: 'Bangalore',
          date: 'April 20th 2018',
          airport: 'Bangalore',
          likes: 1,
          receiver: 'Manish',
          arrivalBay: 'A1',
          time: '16:20'
        },
        {
          passenger: 'Scott Smith',
          destination: 'Hyderabad',
          date: 'April 25th 2018',
          airport: 'Hyderabad',
          likes: 1,
          receiver: 'Siddhiah',
          arrivalBay: 'B1',
          time: '11:20'
        }
      ]
      return <View>{pickups.map((pickup, index) => <CardComponent pickup={pickup} key={index} />)}</View>
    } else if (this.state.activeIndex === 2) {
      const flights = [
        { flight: '6E 702', note: 'New Delhi to Bangalore', arrivalTime: 'ETA 16:40' },
        { flight: 'AI 501', note: 'Hyderabad to Bangalore', arrivalTime: 'Arrived at 16:20' },
        { flight: 'SG 116', note: 'Mumbai to Bangalore', arrivalTime: 'Arrived 16:35. Taxiing' },
        { flight: 'BA 562', note: 'London to Bangalore', arrivalTime: 'ETA 16:40 (Delayed)' }
      ]
      return (
        <View>
          <List>
            {flights.map((flight, index) => (
              <ListItem icon key={index}>
                <Left>
                  <Icon name="ios-plane" />
                </Left>
                <Body>
                  <Text style={{ fontSize: 20, color: 'darkblue' }}>{flight.flight}</Text>
                  <Text note>{flight.note}</Text>
                </Body>
                <Right>
                  <Text>{flight.arrivalTime}</Text>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
            ))}
          </List>
        </View>
      )
    } else if (this.state.activeIndex === 3) {
      const arrivals = [
        // { name: 'Alia Bhat', thumbnail: '1', flight: '6E 702', arrivalBay: 'A1', arrivalTime: 'Taxiing 16:40' },
        // { name: 'Albert Einsteen', thumbnail: '2', flight: 'BA 007', arrivalBay: 'A2', arrivalTime: 'ETA 18:40' },
        // { name: 'Vani', thumbnail: '3', flight: 'AI 007', arrivalBay: 'A1', arrivalTime: 'ETA 19:40' },
        // { name: 'Tereasa', thumbnail: '4', flight: 'AI 007', arrivalBay: 'A1', arrivalTime: 'ETA 19:40' },
        // { name: 'Shahrukh Khan', thumbnail: '7', flight: 'AI 007', arrivalBay: 'A1', arrivalTime: 'ETA 19:40' }
      ]
      const thumbnails = {
        '1': require('../assets/1.jpg'),
        '2': require('../assets/2.jpg'),
        '3': require('../assets/3.jpg'),
        '4': require('../assets/avatar1.png'),
        '5': require('../assets/5.jpg'),
        '6': require('../assets/6.jpg'),
        '7': require('../assets/7.jpg')
      }
      return (
        <View>
          <List>
            {arrivals.map((arr, index) => (
              <ListItem avatar key={index}>
                <Left>
                  <Thumbnail source={thumbnails[arr.thumbnail]} />
                </Left>
                <Body>
                  <Text style={{ fontSize: 20, color: 'darkblue' }}>{arr.name}</Text>
                  <Text note>{arr.flight}</Text>
                  <Text note>{arr.arrivalBay}</Text>
                </Body>
                <Right>
                  <Text>{arr.arrivalTime}</Text>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
            ))}
          </List>
        </View>
      )
    }
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Icon name="menu" />
          </Left>
          <Body>
            <Text style={{ fontSize: 20, color: 'white' }}>Profile History</Text>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.doLogout()}>
              <Icon name="ios-log-out" />
            </Button>
          </Right>
        </Header>

        <Content>
          <View style={{ paddingTop: 10 }}>
            {/** User Photo Stats**/}
            <View style={{ flexDirection: 'row' }}>
              {/** User photo takes 1/3rd of view horizontally **/}
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                <Image source={require('../assets/user1.jpg')} style={{ width: 75, height: 75, borderRadius: 37.5 }} />
              </View>

              {/** User Stats take 2/3rd of view horizontally **/}
              <View style={{ flex: 3 }}>
                {/** Stats **/}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'flex-end'
                  }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text>4.5</Text>
                    <Text style={{ fontSize: 10, color: 'grey' }}>Rating</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text>123</Text>
                    <Text style={{ fontSize: 10, color: 'grey' }}>Received</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text>5 days back</Text>
                    <Text style={{ fontSize: 10, color: 'grey' }}>Last seen</Text>
                  </View>
                </View>

                {/** Edit profile and Settings Buttons **/}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingTop: 10 }}>
                  <View style={{ flexDirection: 'row' }}>
                    {/** Edit profile takes up 3/4th **/}
                    <Button bordered dark style={{ flex: 3, marginLeft: 10, justifyContent: 'center', height: 30 }}>
                      <Text>Edit Profile</Text>
                    </Button>

                    {/** Settings takes up  1/4th place **/}
                    <Button
                      bordered
                      dark
                      onPress={() => this.props.doLogout()}
                      style={{
                        flex: 1,
                        height: 30,
                        marginRight: 10,
                        marginLeft: 5,
                        justifyContent: 'center'
                      }}>
                      <Icon name="settings" style={{ color: 'black' }} />
                    </Button>
                  </View>
                </View>
                {/** End edit profile**/}
              </View>
            </View>

            <View style={{ paddingBottom: 10 }}>
              <View style={{ paddingHorizontal: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>{this.props.login.name}</Text>
                <Text>{this.props.login.role}</Text>
              </View>
            </View>
          </View>

          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                borderTopWidth: 1,
                borderTopColor: '#eae5e5'
              }}>
              <Button onPress={() => this.segmentClicked(0)} transparent active={this.state.activeIndex === 0}>
                <Icon
                  name="ios-notifications-outline"
                  style={[this.state.activeIndex === 0 ? {} : { color: 'grey' }]}
                />
              </Button>
              <Button onPress={() => this.segmentClicked(1)} transparent active={this.state.activeIndex === 1}>
                <Icon
                  name="ios-list-outline"
                  style={[{ fontSize: 32 }, this.state.activeIndex === 1 ? {} : { color: 'grey' }]}
                />
              </Button>
              <Button onPress={() => this.segmentClicked(2)} transparent active={this.state.activeIndex === 2}>
                <Icon name="ios-plane" style={this.state.activeIndex === 2 ? {} : { color: 'grey' }} />
              </Button>
              <Button onPress={() => this.segmentClicked(3)} transparent last active={this.state.activeIndex === 3}>
                <Icon
                  name="ios-people-outline"
                  style={[{ fontSize: 32 }, this.state.activeIndex === 3 ? {} : { color: 'grey' }]}
                />
              </Button>
            </View>

            {/** Height =width/3 so that image sizes vary according to size of the phone yet remain squares **/}

            {this.renderSection(this.props.notifications)}
          </View>
        </Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'notifications']), utils.mapDispatchToProps)(Profile)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
})

/*
{
  /**  // <FlatList
            //     horizontal={false}
            //     numColumns={3}
            //     data={[{ key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'd' }, { key: 'e' }, { key: 'f' }, { key: 'g' }, { key: 'h' }, { key: 'i' }, { key: 'j' }, { key: 'k' }, { key: 'l' }, { key: 'm' }, { key: 'n' }, { key: 'o' }]}
            //     renderItem={({ item, index }) =>
            //         <View style={[{ width: (width) / 3 }, { height: (width) / 3 }, { marginBottom: 2 }, index % 3 !== 0 ? { paddingLeft: 2 } : { paddingLeft: 0 }]}>
            //             <Image style={{
            //                 flex: 1,
            //                 alignSelf: 'stretch',
            //                 width: undefined,
            //                 height: undefined,

            //             }}
            //                 source={images[index]}>
            //             </Image>

            //         </View>
            //     }//end render item
            // />
}
*/
