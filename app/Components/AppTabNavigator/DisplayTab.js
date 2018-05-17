import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { getStatusBarHeight } from 'react-native-status-bar-height'

import { Container, Content, Icon, Thumbnail, Header, Left, Right, Body, List, ListItem } from 'native-base'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import mci from 'react-native-vector-icons/MaterialCommunityIcons'
import Expo from 'expo'
Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.ALL)

class DisplayTab extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="md-laptop" style={{ color: tintColor }} />
  }

  componentDidMount() {
    console.log('DisplayTab DidMount')
    // Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.LANDSCAPE_RIGHT)
  }

  componentWillUnmount() {
    console.log('DisplayTab UnMount')
    // Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT)
  }

  render() {
    const arrivals = [
      { name: 'Alia Bhat', thumbnail: '1', flight: '6E 702', arrivalBay: 'A1', arrivalTime: 'Taxiing 16:40' },
      { name: 'Vani', thumbnail: '3', flight: 'AI 007', arrivalBay: 'A1', arrivalTime: 'ETA 19:40' },
      { name: 'Tereasa', thumbnail: '4', flight: 'AI 007', arrivalBay: 'A1', arrivalTime: 'ETA 19:40' },
      { name: 'Shahrukh Khan', thumbnail: '7', flight: 'AI 007', arrivalBay: 'A1', arrivalTime: 'ETA 19:40' }
    ]
    const arrivals2 = [
      { name: 'Albert Einsteen', thumbnail: '2', flight: 'BA 007', arrivalBay: 'A2', arrivalTime: 'ETA 18:40' }
    ]
    return (
      <Container>
        <Header style={{ paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Icon name="menu" />
          </Left>
          <Body>
            <Text style={{ fontSize: 20, color: 'white' }}>Display on Monitor</Text>
          </Body>
        </Header>
        <Content>
          <DisplayList arrivals={arrivals} arrivalBay="A1" />
          <DisplayList arrivals={arrivals2} arrivalBay="A2" />
        </Content>
      </Container>
    )
  }
}
export default DisplayTab

const DisplayList = props => {
  const thumbnails = {
    '1': require('../../assets/1.jpg'),
    '2': require('../../assets/2.jpg'),
    '3': require('../../assets/3.jpg'),
    '4': require('../../assets/avatar1.png'),
    '5': require('../../assets/5.jpg'),
    '6': require('../../assets/6.jpg'),
    '7': require('../../assets/7.jpg')
  }
  return (
    <List>
      <ListItem itemHeader first>
        <Text style={{ fontSize: 20, backgroundColor: 'gray' }}>Bay: {props.arrivalBay}</Text>
      </ListItem>
      {props.arrivals.map((arr, index) => (
        <ListItem avatar key={index}>
          <Left>
            <Thumbnail source={thumbnails[arr.thumbnail]} />
          </Left>
          <Body>
            <Text style={{ fontSize: 20, color: 'darkblue' }}>{arr.name}</Text>
            <Text note>{arr.flight}</Text>
          </Body>
          <Right>
            <Text>{arr.arrivalTime}</Text>
          </Right>
        </ListItem>
      ))}
    </List>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
