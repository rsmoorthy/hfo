import React, { Component } from 'react'
import { View, Text, Button, StyleSheet, Platform, ActivityIndicator, StatusBar, Dimensions } from 'react-native'

import Login from './Login'
import PassengerHome from './PassengerHome'
import UserList from './UserList'
import UserForm from './UserForm'
import FlightArrivals from './FlightArrivals'
import SearchTab from './AppTabNavigator/SearchTab'
import AddMediaTab from './AppTabNavigator/AddMediaTab'
import LikesTab from './AppTabNavigator/LikesTab'
import Profile from './Profile'
import DisplayList from './DisplayList'
import PassengerArrivalsTab from './AppTabNavigator/PassengerArrivalsTab'
import Signup from './Signup'
import PickupForm from './PickupForm'
import PickupList from './PickupList'
import DisplayTab from './AppTabNavigator/DisplayTab'
import { connect } from 'react-redux'
import * as utils from '../utils'
import registerForPushNotifications from '../services/notifications'

import {
  TabNavigator,
  createStackNavigator,
  createDrawerNavigator,
  createTabNavigator,
  createBottomTabNavigator,
  createSwitchNavigator
} from 'react-navigation'
import { Icon } from 'native-base'
import { Font, AppLoading, Expo, ScreenOrientation, Notifications } from 'expo'
import NavigatorService from '../services/navigator'

ScreenOrientation.allow(ScreenOrientation.Orientation.ALL)
const navigationOptions = {
  animationEnabled: true,
  swipeEnabled: true,
  tabBarPosition: 'bottom',
  tabBarOptions: {
    style: {
      ...Platform.select({
        android: {
          backgroundColor: 'white'
        }
      })
    },
    activeTintColor: '#55acee',
    inactiveTintColor: '#000000', // '#d1cece',
    showLabel: true,
    showIcon: true
  }
}

class MainScreen extends Component {
  onLayout(e) {
    var { height, width } = Dimensions.get('window')
    console.log('onlayout changed', height, width)
  }

  async componentDidMount() {
    Dimensions.addEventListener('change', this.onLayout.bind(this))
    let expoToken = await registerForPushNotifications()
    console.log('setting expo token', expoToken)
    this.props.setExpoToken(expoToken)
    this._notificationSubscription = Notifications.addListener(this._handleNotification)
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.onLayout.bind(this))
  }

  _handleNotification = notification => {
    notification.data.time = new Date()
    console.log('notification received', notification)
    this.props.doReceiveNotification(notification.data)
  }

  // static navigationOptions = {

  //     headerLeft: <Icon name="ios-camera-outline" style={{ paddingLeft: 10 }} />,
  //     title: "Instagram",
  //     headerRight: <Icon style={{ paddingRight: 10 }} name="ios-send-outline" />
  // }
  static navigationOptions = {
    header: null
  }

  render() {
    const pickupStack = createStackNavigator({ PickupList, PickupForm }, { initialRouteName: 'PickupList' })
    const adminUsersStack = createStackNavigator({ UserList, UserForm }, { initialRouteName: 'UserList' })
    const authStack = createSwitchNavigator(
      {
        Login: Login,
        Signup: Signup
      },
      { initialRouteName: 'Login' }
    )
    let userStack
    if (this.props.login.role === 'Receiver') {
      userStack = createTabNavigator(
        {
          Pickups: {
            screen: pickupStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />
            }
          },
          FlightArrivals: FlightArrivals,
          PassengerArrivalsTab: PassengerArrivalsTab,
          Profile: Profile
        },
        navigationOptions
      )
    } else if (this.props.login.role === 'BookingAgent') {
      userStack = createTabNavigator(
        {
          Pickups: {
            screen: pickupStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />
            }
          },
          FlightArrivals: FlightArrivals,
          PassengerArrivalsTab: PassengerArrivalsTab,
          Profile: Profile
        },
        navigationOptions
      )
    } else if (this.props.login.role === 'Passenger') {
      userStack = createTabNavigator(
        {
          PassengerHome: PassengerHome,
          Profile: Profile
        },
        navigationOptions
      )
    } else if (this.props.login.role === 'Display') {
      const noptions = {
        ...navigationOptions,
        tabBarOptions: {
          ...navigationOptions.tabBarOptions,
          showLabel: false,
          showIcon: false
        }
      }
      console.log(noptions)
      userStack = createTabNavigator(
        {
          DisplayList: DisplayList
        },
        noptions
      )
    } else if (this.props.login.role === 'Admin') {
      userStack = createTabNavigator(
        {
          Users: {
            screen: adminUsersStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-people" style={{ color: tintColor }} />
            }
          },
          Pickups: {
            screen: pickupStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />
            }
          },
          FlightArrivals: FlightArrivals,
          Profile: Profile
        },
        navigationOptions
      )
    }

    const stack = {
      Auth: authStack
    }

    if (this.props.login.role !== '') stack.Main = userStack

    const MyAppNavigator = createSwitchNavigator(stack, {
      initialRouteName: this.props.login.role === '' ? 'Auth' : 'Main'
    })
    return (
      <MyAppNavigator
        ref={nav => {
          NavigatorService.setContainer(nav)
        }}
      />
    )
  }
}

class HomeScreen2 extends React.Component {
  render() {
    return (
      <View>
        <Text>Home</Text>
        <Button title="Menu" onPress={() => this.props.navigation.toggleDrawer()} />
      </View>
    )
  }
}

class OtherScreen2 extends React.Component {
  render() {
    const np = this.props.navigation.getParam('addl', '0')
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Other</Text>
        <Button title="Go to Signin" onPress={() => NavigatorService.navigate('Auth', {}, 'SignIn')} />
        <Button title="Go to Signout" onPress={() => NavigatorService.navigate('Auth', {}, 'SignOut')} />
        <Button title="Go to Home" onPress={() => NavigatorService.navigate('App', {}, 'Home')} />
        <Button title="Go to Home 2" onPress={() => this.props.navigation.push('Home')} />
        <Button title="Go to Signin 2" onPress={() => NavigatorService.push('Auth', {})} />
        <Button title="Menu" onPress={() => this.props.navigation.toggleDrawer()} />
      </View>
    )
  }
}

class SignInScreen2 extends React.Component {
  render() {
    return (
      <View>
        <Text>Signin</Text>
        <Button title="Menu" onPress={() => this.props.navigation.toggleDrawer()} />
      </View>
    )
  }
}

class SignOutScreen2 extends React.Component {
  render() {
    return (
      <View>
        <Text>SignOut</Text>
        <Button title="Menu" onPress={() => this.props.navigation.toggleDrawer()} />
      </View>
    )
  }
}

class AuthLoading extends React.Component {
  constructor(props) {
    super(props)
    setTimeout(() => props.navigation.navigate('Other', { addl: '1' }), 5000)
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Auth Loading</Text>
        <ActivityIndicator />
        <StatusBar translucent={true} barStyle="dark-content" />
      </View>
    )
  }
}

const AppStack = createTabNavigator({ Home: HomeScreen2, Other: OtherScreen2 })
const AuthStack = createTabNavigator({ SignIn: SignInScreen2, SignOut: SignOutScreen2 })
const MainScreen2 = createSwitchNavigator(
  {
    AuthLoading: AuthLoading,
    App: AppStack,
    Auth: AuthStack
  },
  {
    initialRouteName: 'AuthLoading'
  }
)

const MainScreen3 = createDrawerNavigator({
  App: AppStack,
  Auth: AuthStack
})

export default connect(utils.mapStateToProps('hfo', ['login']), utils.mapDispatchToProps)(MainScreen)

const AppTabNavigator = createTabNavigator(
  {
    Login: {
      screen: Login
    },
    Signup: {
      screen: Signup
    },
    PickupForm: {
      screen: PickupForm
    },
    PassengerHome: {
      screen: PassengerHome
    },
    FlightArrivals: {
      screen: FlightArrivals
    },
    PassengerArrivalsTab: {
      screen: PassengerArrivalsTab
    },
    Profile: {
      screen: Profile
    },
    DisplayTab: {
      screen: DisplayTab
    }
  },
  {
    animationEnabled: true,
    swipeEnabled: true,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      style: {
        ...Platform.select({
          android: {
            backgroundColor: 'white'
          }
        })
      },
      activeTintColor: '#55acee',
      inactiveTintColor: '#000000', // '#d1cece',
      showLabel: false,
      showIcon: true
    }
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
