import React, { Component } from 'react'
import { View, ScrollView, Image, StyleSheet, Platform, ActivityIndicator, StatusBar, Dimensions } from 'react-native'

import Login from './Login'
import PassengerHome, { PastPassengerList } from './PassengerHome'
import { UserList } from './UserList'
import UserForm from './UserForm'
import FlightArrivals from './FlightArrivals'
import SearchTab from './AppTabNavigator/SearchTab'
import AddMediaTab from './AppTabNavigator/AddMediaTab'
import LikesTab from './AppTabNavigator/LikesTab'
import Profile from './Profile'
import DisplayList from './DisplayList'
import Signup from './Signup'
import PickupForm, { AssignReceiverModal, RequestPickup } from './PickupForm'
import PickupList, { PickupView, PastPickupList } from './PickupList'
import AdminScreen, { AdminTemplatesList, AdminTemplatesForm } from './AdminScreen'
import ModalScreen, { FeedbackModal } from './ModalScreen'
import GetPhotoModal from './GetPhotoModal'
import DisplayTab from './AppTabNavigator/DisplayTab'
import { connect } from 'react-redux'
import * as utils from '../utils'
import registerForPushNotifications from '../services/notifications'

import {
  DrawerItems,
  DrawerActions,
  SafeAreaView,
  TabNavigator,
  createStackNavigator,
  createDrawerNavigator,
  createBottomTabNavigator,
  createSwitchNavigator
} from 'react-navigation'
import { Icon, Button, Text, Root } from 'native-base'
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
    showLabel: false,
    showIcon: true
  },
  // drawerBackgroundColor: '#0094d7',
  drawerWidth: 250,
  contentComponent: connect(null, utils.mapDispatchToProps)(props => (
    <ScrollView>
      <View
        style={{ flex: 1, height: 120, backgroundColor: '#0094d7', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          style={{ alignSelf: 'stretch', flex: 0.5, height: undefined, width: undefined }}
          source={require('../assets/icon.png')}
          resizeMode="contain"
        />
      </View>
      {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Button transparent small danger onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())}>
          <Icon name="ios-close-circle" />
        </Button>
      </View> */}
      <DrawerItems {...props} />
      <Button small warning title="Logout" onPress={props.doLogout} style={{ marginBottom: 10 }}>
        <Icon name="ios-log-out" onPress={props.doLogout} />
        <Text>Logout</Text>
      </Button>
    </ScrollView>
  ))
}

function forVertical(props) {
  const { layout, position, scene } = props

  const index = scene.index
  const height = layout.initHeight

  const translateX = 0
  const translateY = position.interpolate({
    inputRange: ([index - 1, index, index + 1]: Array<number>),
    outputRange: ([height, 0, 0]: Array<number>)
  })

  return {
    transform: [{ translateX }, { translateY }]
  }
}

class MainScreen extends Component {
  onLayout(e) {
    var { height, width } = Dimensions.get('window')
    console.log('onlayout changed', height, width)
  }

  async componentDidMount() {
    Dimensions.addEventListener('change', this.onLayout.bind(this))
    let expoToken = await registerForPushNotifications().catch(err => console.log('expotoken', err.message))
    if (expoToken) {
      console.log('setting expo token', expoToken)
      this.props.setExpoToken(expoToken)
    }
    this._notificationSubscription = Notifications.addListener(this._handleNotification)
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.onLayout.bind(this))
  }

  _handleNotification = notification => {
    notification.data.time = new Date()
    console.log('notification received', notification, this.props.meta.lastNotificationId, notification.notificationId)
    if (this.props.meta.lastNotificationId === notification.notificationId) return
    if (notification.data.id && notification.data.type === 'pickup') {
      console.log('pickup notification received', notification.data.id)
      this.props.getPickups('id', notification.data.id, item => {
        // this.props.navigation.navigate('PickupView', { pickup: item })
        NavigatorService.navigate(this.props.login.role === 'Passenger' ? 'Home' : 'PickupView', { pickup: item })
      })
      this.props.doReceiveNotification(
        {
          ...notification.data,
          notificationId: notification.notificationId,
          remote: notification.remote,
          origin: notification.origin
        },
        false
      )
    }
    if (notification.data.type === 'logout') {
      this.props.doLogout()
      this.props.doReceiveNotification({ notificationId: notification.notificationId }, true)
      Notifications.dismissNotificationAsync(notification.notificationId)
    }
  }

  // static navigationOptions = {

  //     headerLeft: <Icon name="ios-camera-outline" style={{ paddingLeft: 10 }} />,
  //     title: "Instagram",
  //     headerRight: <Icon style={{ paddingRight: 10 }} name="ios-send-outline" />
  // }
  static navigationOptions = {
    header: null
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.login.role === this.props.login.role) return false
    return true
  }

  render() {
    const pickupStack = createStackNavigator({ PickupList, PickupView, PickupForm }, { initialRouteName: 'PickupList' })
    const pastPickupStack = createStackNavigator({ PastPickupList, PickupView }, { initialRouteName: 'PastPickupList' })
    const adminUsersStack = createStackNavigator({ UserList, UserForm }, { initialRouteName: 'UserList' })
    const adminScreensStack = createStackNavigator(
      { AdminScreen, AdminTemplatesList, AdminTemplatesForm, UserList, UserForm },
      { initialRouteName: 'AdminScreen' }
    )
    const authStack = createSwitchNavigator(
      {
        Login: Login,
        Signup: Signup
      },
      { initialRouteName: 'Login' }
    )
    let userStack
    if (this.props.login.role === 'Receiver') {
      userStack = createDrawerNavigator(
        {
          Pickups: {
            screen: pickupStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
              drawerIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />
            }
          },
          PastPickups: {
            screen: pastPickupStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-car-outline" style={{ color: tintColor }} />,
              drawerIcon: ({ tintColor }) => <Icon name="ios-car-outline" style={{ color: tintColor }} />,
              drawerLabel: 'Past Pickups'
            }
          },
          FlightArrivals: FlightArrivals,
          Profile: Profile
        },
        navigationOptions
      )
    } else if (this.props.login.role === 'Agent') {
      userStack = createDrawerNavigator(
        {
          Pickups: {
            screen: pickupStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
              drawerIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />
            }
          },
          'New Pickup': PickupForm,
          PastPickups: {
            screen: pastPickupStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-car-outline" style={{ color: tintColor }} />,
              drawerIcon: ({ tintColor }) => <Icon name="ios-car-outline" style={{ color: tintColor }} />,
              drawerLabel: 'Past Pickups'
            }
          },
          FlightArrivals: FlightArrivals,
          Profile: Profile
        },
        navigationOptions
      )
    } else if (this.props.login.role === 'Passenger') {
      userStack = createDrawerNavigator(
        {
          Home: PassengerHome,
          RequestPickup: RequestPickup,
          PastPickups: PastPickupList,
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
      userStack = createDrawerNavigator(
        {
          DisplayList: DisplayList
        },
        noptions
      )
    } else if (this.props.login.role === 'Admin') {
      userStack = createDrawerNavigator(
        {
          Users: {
            screen: adminUsersStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-people" style={{ color: tintColor }} />,
              drawerIcon: ({ tintColor }) => <Icon name="ios-people" style={{ color: tintColor }} />
            }
          },
          'New Pickup': PickupForm,
          Pickups: {
            screen: pickupStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />,
              drawerIcon: ({ tintColor }) => <Icon name="ios-car" style={{ color: tintColor }} />
            }
          },
          PastPickups: {
            screen: pastPickupStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-car-outline" style={{ color: tintColor }} />,
              drawerIcon: ({ tintColor }) => <Icon name="ios-car-outline" style={{ color: tintColor }} />,
              drawerLabel: 'Past Pickups'
            }
          },
          Profile: Profile,
          Admin: {
            screen: adminScreensStack,
            navigationOptions: {
              tabBarIcon: ({ tintColor }) => <Icon name="ios-apps" style={{ color: tintColor }} />,
              drawerIcon: ({ tintColor }) => <Icon name="ios-apps" style={{ color: tintColor }} />,
              header: null
            }
          },
          // CameraView: CameraView,
          FlightArrivals: FlightArrivals
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

    const RootNavigator = createStackNavigator(
      {
        Main: MyAppNavigator,
        Modal: ModalScreen,
        GetPhotoModal: GetPhotoModal,
        AssignReceiverModal: AssignReceiverModal,
        FeedbackModal: FeedbackModal
      },
      {
        mode: 'modal',
        header: null,
        headerMode: 'none',
        transitionConfig: () => ({ screenInterpolator: forVertical }),
        cardStyle: {
          opacity: 1,
          backgroundColor: 'transparent'
        }
      }
    )
    return (
      <Root>
        <RootNavigator
          ref={nav => {
            NavigatorService.setContainer(nav, 'within Root')
          }}
        />
      </Root>
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

/*
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
*/

export default connect(utils.mapStateToProps('hfo', ['login', 'meta']), utils.mapDispatchToProps)(MainScreen)

/*
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
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
