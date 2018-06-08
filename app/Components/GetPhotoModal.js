import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as utils from '../utils'
import { View, StatusBar, StyleSheet, TouchableOpacity, Platform, Image, Modal, TouchableHighlight } from 'react-native'
import moment from 'moment'
import { Constants, Camera, Permissions, ImagePicker, MapView, Marker, KeepAwake } from 'expo'
import StarRating from 'react-native-star-rating'

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

class GetPhotoModal extends Component {
  state = {
    image: null,
    permissionsGranted: false
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    const { status2 } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
    this.setState({ permissionsGranted: status === 'granted' })
  }

  componentDidMount() {
    this.props.setOpacity(0.4)
  }

  componentWillUnmount() {
    this.props.setOpacity(1.0)
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.9,
      base64: true,
      aspect: [1, 1]
    })

    if (!result.cancelled) {
      this.setState({ image: result.uri })
      this.props.doUpdateLoginData({
        id: this.props.login.id,
        photo: 'data:image/jpeg;base64,' + result.base64
      })
    }
  }

  openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
      aspect: [1, 1]
    })

    if (!result.cancelled) {
      this.setState({ image: result.uri })
      this.props.doUpdateLoginData({
        id: this.props.login.id,
        photo: 'data:image/jpeg;base64,' + result.base64
      })
    }
  }

  render() {
    let { image } = this.state

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ backgroundColor: 'white', borderColor: 'gray', width: '60%', borderRadius: 8, borderWidth: 1 }}>
          <Icon name="close-circle" style={{ alignSelf: 'flex-end' }} onPress={() => this.props.navigation.goBack()} />
          <View style={{ padding: 20 }}>
            <Button style={{ alignSelf: 'stretch', marginBottom: 20 }} title="From Gallery" onPress={this.pickImage}>
              <Text>From Gallery</Text>
            </Button>
            <Button style={{ alignSelf: 'stretch', marginBottom: 20 }} onPress={this.openCamera}>
              <Text>Take Picture (Camera)</Text>
            </Button>
            {image && <Image source={{ uri: image }} style={{ width: 80, height: 80 }} />}
          </View>
        </View>
      </View>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login']), utils.mapDispatchToProps)(GetPhotoModal)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
