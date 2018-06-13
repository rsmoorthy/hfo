import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, Dimensions, FlatList, TouchableOpacity, TouchableHighlight } from 'react-native'
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

class Profile extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="person" style={{ color: tintColor }} />,
    drawerIcon: ({ tintColor }) => <Icon name="person" style={{ color: tintColor }} />
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

  renderSection() {
    if (this.state.activeIndex === 0) {
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
      return (
        <View>
          <Text>Dummy</Text>
        </View>
      )
    } else if (this.state.activeIndex === 2) {
      return (
        <View>
          <Text>Dummy</Text>
        </View>
      )
    } else if (this.state.activeIndex === 3) {
      return (
        <View>
          <Text>Dummy</Text>
        </View>
      )
    }
  }

  render() {
    const opacity = this.props.meta.screenOpacity
    const photo =
      this.props.login.photo && this.props.login.photo.length
        ? { uri: this.props.login.photo }
        : require('../assets/user1.jpg')
    return (
      <Container style={{ flex: 1, backgroundColor: '#EAE8EF', opacity: opacity }}>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="menu" onPress={this.props.navigation.openDrawer} />
            </Button>
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
                <TouchableOpacity onPress={() => this.props.navigation.push('GetPhotoModal')}>
                  <Image source={photo} style={{ width: 75, height: 75, borderRadius: 37.5 }} />
                </TouchableOpacity>
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
                    <Button
                      bordered
                      dark
                      onPress={() => this.props.navigation.navigate('Modal')}
                      style={{ flex: 3, marginLeft: 10, justifyContent: 'center', height: 30 }}>
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
export default connect(utils.mapStateToProps('hfo', ['login', 'notifications', 'meta']), utils.mapDispatchToProps)(
  Profile
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAE8EF'
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
