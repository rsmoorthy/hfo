import React from 'react'
import { Provider } from 'react-redux'
import { StyleSheet, Text, View, YellowBox, AppState } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import MainScreen from './Components/MainScreen'
import { Font, AppLoading, Expo, Notifications } from 'expo'
import NavigatorService from './services/navigator'
import { PersistGate } from 'redux-persist/integration/react'

import { store, persistor } from './store'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { loading: true }
  }

  handleAppState = nextAppState => {
    console.log('App changed state', nextAppState)
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf')
    })
    AppState.addEventListener('change', this.handleAppState)
    this.setState({ loading: false })
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppState)
  }

  render() {
    if (this.state.loading) {
      return (
        <Provider store={store}>
          <AppLoading />
        </Provider>
      )
    }
    return (
      <Provider store={store}>
        <PersistGate loading={<AppLoading />} persistor={persistor}>
          <MainScreen
            ref={nav => {
              NavigatorService.setContainer(nav)
            }}
          />
        </PersistGate>
      </Provider>
    )
  }
}

const AppStackNavigator = createStackNavigator({
  Main: {
    screen: MainScreen
  }
})

console.disableYellowBox = true

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
