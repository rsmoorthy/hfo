import React from 'react'
import { StyleSheet, Text, View, AppState } from 'react-native'
import { Provider } from 'react-redux'
import { Font, AppLoading, Expo, Notifications } from 'expo'
import { PersistGate } from 'redux-persist/integration/react'

import Login, { WebMain } from './Components/Login'

import { store, persistor } from './store'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { loading: true }
  }

  handleAppState = nextAppState => {
    console.log('App changed state', nextAppState)
  }

  componentWillMount() {
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
          <WebMain />
        </PersistGate>
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
