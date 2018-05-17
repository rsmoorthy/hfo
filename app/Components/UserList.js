import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { View, StyleSheet } from 'react-native'

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

class UserList extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => <Icon name="ios-people" style={{ color: tintColor }} />,
    header: null
  }

  componentWillMount() {
    this.props.dispatch({ type: 'UPDATE_USER_RESET' })
    this.props.getUserList()
  }

  render() {
    const users = this.props.users
    const getUserList = this.props.getUserList
    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Left>
            <Button transparent>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>Users</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.getUserList()}>
              <Icon name="ios-refresh" />
            </Button>
            <Button transparent onPress={() => this.props.doLogout()}>
              <Icon name="ios-log-out" />
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            {users.map((user, index) => (
              <ListItem key={index} onPress={() => this.props.navigation.push('UserForm', { user: user })}>
                <Body>
                  <View>
                    <Text style={{ fontSize: 20, color: 'darkblue' }}>{user.name}</Text>
                    <Text note>
                      {user.email} {user.mobile}
                    </Text>
                  </View>
                </Body>
                <Right>
                  <Text>{user.role}</Text>
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
            ))}
          </List>
          <Button danger small rounded onPress={() => this.props.getUserList()}>
            <Text> Refresh </Text>
          </Button>
        </Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'users', 'meta']), utils.mapDispatchToProps)(UserList)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
