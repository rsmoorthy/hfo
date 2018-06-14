import React, { Component } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import moment from 'moment'

import { Card, CardItem, Thumbnail, Body, Left, Right, Button, Icon, Text, List, ListItem } from 'native-base'

class CardComponent extends Component {
  render() {
    const images = {
      Bangalore: require('../assets/blr_airport2.jpg'),
      Hyderabad: require('../assets/hyd_airport.jpg'),
      NewDelhi: require('../assets/delhi_airport1.jpg'),
      Others: require('../assets/blr_airport1.jpg')
    }

    const pickup = this.props.pickup
    console.log(pickup)

    return (
      <Card>
        <CardItem>
          <Left>
            <Thumbnail source={require('../assets/user1.jpg')} />
            <Body>
              <Text>{pickup.name} </Text>
              <Text note>{pickup.airport}</Text>
              <Text note>{moment(pickup.pickupDate).format('YYYY-MM-DD')}</Text>
            </Body>
          </Left>
        </CardItem>
        <CardItem cardBody>
          {/* <Image source={images[pickup.airport]} style={{ height: 120, width: null, flex: 1 }} /> */}
        </CardItem>
        <CardItem style={{ height: 45 }}>
          <Left>
            <Button transparent>
              <Icon name="ios-heart-outline" style={{ color: 'black' }} />
            </Button>
            <Button transparent>
              <Icon name="ios-send-outline" style={{ color: 'black' }} />
            </Button>
          </Left>
        </CardItem>
        <List>
          <ListItem>
            <Left>
              <Text>Flight</Text>
            </Left>
            <Body>
              <Text>{pickup.flight}</Text>
            </Body>
          </ListItem>
          <ListItem>
            <Left>
              <Text>Receiver</Text>
            </Left>
            <Body>
              <Text>{pickup.receiver ? pickup.receiver.name : ''}</Text>
            </Body>
          </ListItem>
          <ListItem>
            <Left>
              <Text>Arrival Bay</Text>
            </Left>
            <Body>
              <Text>{pickup.arrivalBay}</Text>
            </Body>
          </ListItem>
          <ListItem>
            <Left>
              <Text>Arrival Date and Time</Text>
            </Left>
            <Body>
              <Text>{moment(pickup.pickupDate).format('YYYY-MM-DD')}</Text>
              <Text>{moment(pickup.pickupDate).format('hh:mm')}</Text>
            </Body>
          </ListItem>
        </List>
      </Card>
    )
  }
}
export default CardComponent

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
