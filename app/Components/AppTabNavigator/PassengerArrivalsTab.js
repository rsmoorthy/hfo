import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { Container, Content, Icon, Thumbnail, Header, Left, Right, Body, List, ListItem } from 'native-base'
import { getStatusBarHeight } from 'react-native-status-bar-height'

class PassengerArrivalsTab extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-paper-plane" style={{ color: tintColor }} />
  }

  render() {
    const arrivals = [
      { name: 'Alia Bhat', thumbnail: '1', flight: '6E 702', arrivalBay: 'A1', arrivalTime: 'Taxiing 16:40' },
      { name: 'Albert Einsteen', thumbnail: '2', flight: 'BA 007', arrivalBay: 'A2', arrivalTime: 'ETA 18:40' },
      { name: 'Vani', thumbnail: '3', flight: 'AI 007', arrivalBay: 'A1', arrivalTime: 'ETA 19:40' },
      { name: 'Tereasa', thumbnail: '4', flight: 'AI 007', arrivalBay: 'A1', arrivalTime: 'ETA 19:40' },
      { name: 'Shahrukh Khan', thumbnail: '7', flight: 'AI 007', arrivalBay: 'A1', arrivalTime: 'ETA 19:40' }
    ]
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
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Icon name="menu" />
          </Left>
          <Body>
            <Text style={{ fontSize: 20, color: 'white' }}>Passenger Arrivals</Text>
          </Body>
        </Header>
        <Content>
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
        </Content>
      </Container>
    )
  }
}
export default PassengerArrivalsTab

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
