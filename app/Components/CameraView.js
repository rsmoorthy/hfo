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

import { Ionicons, MaterialIcons, Foundation, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'

const landmarkSize = 2

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off'
}

const flashIcons = {
  off: 'flash-off',
  on: 'flash-on',
  auto: 'flash-auto',
  torch: 'highlight'
}

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto'
}

const wbIcons = {
  auto: 'wb-auto',
  sunny: 'wb-sunny',
  cloudy: 'wb-cloudy',
  shadow: 'beach-access',
  fluorescent: 'wb-iridescent',
  incandescent: 'wb-incandescent'
}

class CameraView extends Component {
  state = {
    hasCameraPermission: null,
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    ratios: [],
    barcodeScanning: false,
    faceDetecting: true,
    faces: [],
    newPhotos: false,
    permissionsGranted: false,
    pictureSize: undefined,
    pictureSizes: [],
    pictureSizeId: 0,
    showGallery: false,
    showMoreOptions: false,
    image: null,
    rating: null,
    modalVisible: false
  }

  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatios()
    return ratios
  }

  toggleMoreOptions = () => this.setState({ showMoreOptions: !this.state.showMoreOptions })

  toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' })

  toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] })

  setRatio = ratio => this.setState({ ratio })

  toggleWB = () => this.setState({ whiteBalance: wbOrder[this.state.whiteBalance] })

  toggleFocus = () => this.setState({ autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on' })

  zoomOut = () => this.setState({ zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1 })

  zoomIn = () => this.setState({ zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1 })

  setFocusDepth = depth => this.setState({ depth })

  toggleFaceDetection = () => this.setState({ faceDetecting: !this.state.faceDetecting })

  onPictureSaved = photo => {
    console.log(photo)
  }

  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved, base64: true }).then(async photo => {
        console.log('takepicture', photo.height, photo.width, photo.base64.substr(0, 100))

        const cropdata = {
          offset: { x: 0, y: 0 },
          size: { width: 100, height: 100 }
        }
      })
    }
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    const { status2 } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
    this.setState({ permissionsGranted: status === 'granted' })
    this.setState({ modalVisible: false })
    setTimeout(() => this.setState({ modalVisible: true }), 8000)
  }

  onFacesDetected = ({ faces }) => this.setState({ faces })
  onFaceDetectionError = state => console.warn('Faces detection error:', state)

  collectPictureSizes = async () => {
    if (!this.camera) {
      const pictureSizes = await this.camera.getAvailablePictureSizesAsync(this.state.ratio)
      let pictureSizeId = 0
      if (Platform.OS === 'ios') {
        pictureSizeId = pictureSizes.indexOf('High')
      } else {
        // returned array is sorted in ascending order - default size is the largest one
        pictureSizeId = pictureSizes.length - 1
      }
      this.setState({ pictureSizes, pictureSizeId, pictureSize: pictureSizes[pictureSizeId] })
    }
  }

  previousPictureSize = () => this.changePictureSize(1)
  nextPictureSize = () => this.changePictureSize(-1)

  changePictureSize = direction => {
    let newId = this.state.pictureSizeId + direction
    const length = this.state.pictureSizes.length
    if (newId >= length) {
      newId = 0
    } else if (newId < 0) {
      newId = length - 1
    }
    this.setState({ pictureSize: this.state.pictureSizes[newId], pictureSizeId: newId })
  }

  renderGallery() {
    return <GalleryScreen onPress={this.toggleView.bind(this)} />
  }

  renderFace({ bounds, faceID, rollAngle, yawAngle }) {
    return (
      <View
        key={faceID}
        transform={[
          { perspective: 600 },
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` }
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y
          }
        ]}>
        <Text style={styles.faceText}>ID: {faceID}</Text>
        <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
      </View>
    )
  }

  renderLandmarksOfFace(face) {
    const renderLandmark = position =>
      position && (
        <View
          style={[
            styles.landmark,
            {
              left: position.x - landmarkSize / 2,
              top: position.y - landmarkSize / 2
            }
          ]}
        />
      )
    return (
      <View key={`landmarks-${face.faceID}`}>
        {renderLandmark(face.leftEyePosition)}
        {renderLandmark(face.rightEyePosition)}
        {renderLandmark(face.leftEarPosition)}
        {renderLandmark(face.rightEarPosition)}
        {renderLandmark(face.leftCheekPosition)}
        {renderLandmark(face.rightCheekPosition)}
        {renderLandmark(face.leftMouthPosition)}
        {renderLandmark(face.mouthPosition)}
        {renderLandmark(face.rightMouthPosition)}
        {renderLandmark(face.noseBasePosition)}
        {renderLandmark(face.bottomMouthPosition)}
      </View>
    )
  }

  renderFaces = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>
  )

  renderLandmarks = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderLandmarksOfFace)}
    </View>
  )

  renderNoPermissions = () => (
    <View style={styles.noPermissions}>
      <Text style={{ color: 'white' }}>Camera permissions not granted - cannot open camera preview.</Text>
    </View>
  )

  renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFacing}>
        <Ionicons name="ios-reverse-camera" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFlash}>
        <MaterialIcons name={flashIcons[this.state.flash]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleWB}>
        <MaterialIcons name={wbIcons[this.state.whiteBalance]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFocus}>
        <Text style={[styles.autoFocusLabel, { color: this.state.autoFocus === 'on' ? 'white' : '#6b6b6b' }]}>AF</Text>
      </TouchableOpacity>
    </View>
  )

  renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleMoreOptions}>
        <Octicons name="kebab-horizontal" size={30} color="white" />
      </TouchableOpacity>
      <View style={{ flex: 0.4 }}>
        <TouchableOpacity onPress={this.takePicture} style={{ alignSelf: 'center' }}>
          <Ionicons name="ios-radio-button-on" size={70} color="white" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.bottomButton}>
        <View>
          <Foundation name="thumbnails" size={30} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  )

  renderMoreOptions = () => (
    <View style={styles.options}>
      <View style={styles.detectors}>
        <TouchableOpacity onPress={this.toggleFaceDetection}>
          <MaterialIcons name="tag-faces" size={32} color={this.state.faceDetecting ? 'white' : '#858585'} />
        </TouchableOpacity>
      </View>

      <View style={styles.pictureSizeContainer}>
        <Text style={styles.pictureQualityLabel}>Picture quality</Text>
        <View style={styles.pictureSizeChooser}>
          <TouchableOpacity onPress={this.previousPictureSize} style={{ padding: 6 }}>
            <Ionicons name="md-arrow-dropleft" size={14} color="white" />
          </TouchableOpacity>
          <View style={styles.pictureSizeLabel}>
            <Text style={{ color: 'white' }}>{this.state.pictureSize}</Text>
          </View>
          <TouchableOpacity onPress={this.nextPictureSize} style={{ padding: 6 }}>
            <Ionicons name="md-arrow-dropright" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  renderCamera = () => (
    <View style={{ flex: 1 }}>
      <Camera
        ref={ref => {
          this.camera = ref
        }}
        style={styles.camera}
        onCameraReady={this.collectPictureSizes}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        pictureSize={this.state.pictureSize}
        faceDetectionLandmarks={Camera.Constants.FaceDetection.Landmarks.all}
        onFacesDetected={this.state.faceDetecting ? this.onFacesDetected : undefined}
        onFaceDetectionError={this.onFaceDetectionError}
        onBarCodeRead={this.state.barcodeScanning ? this.onBarCodeRead : undefined}>
        {this.renderTopBar()}
        {this.renderBottomBar()}
      </Camera>
      {this.state.faceDetecting && this.renderFaces()}
      {this.state.faceDetecting && this.renderLandmarks()}
      {this.state.showMoreOptions && this.renderMoreOptions()}
    </View>
  )

  render2() {
    const cameraScreenContent = this.state.permissionsGranted ? this.renderCamera() : this.renderNoPermissions()
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent
    return <View style={styles.container}>{content}</View>
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.9,
      base64: true,
      aspect: [4, 3]
    })

    console.log(result)

    if (!result.cancelled) {
      this.setState({ image: result.uri })
    }
  }

  openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
      aspect: [4, 3]
    })

    console.log(result)

    if (!result.cancelled) {
      this.setState({ image: result.uri })
    }
  }

  onStarRatingPress = rating => {
    this.setState({ rating })
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible })
  }

  render() {
    let { image } = this.state

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <KeepAwake />
        <Button title="Pick an image from camera roll" onPress={this.pickImage}>
          <Text>Pick an image from camera roll</Text>
        </Button>
        <Button title="Open Camera" onPress={this.openCamera}>
          <Text>Open Camera</Text>
        </Button>
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        <StarRating
          disabled={false}
          maxStars={5}
          rating={this.state.rating}
          selectedStar={rating => this.onStarRatingPress(rating)}
        />
        <MapView
          style={{ alignSelf: 'stretch', height: 400 }}
          onRegionChangeComplete={() => this.marker && this.marker.showCallout()}
          initialRegion={{
            latitude: 50.1674,
            longitude: 9.187,
            latitudeDelta: 1,
            longitudeDelta: 1
          }}>
          <MapView.Marker
            ref={marker => (this.marker = marker)}
            coordinate={{ latitude: 50.1674, longitude: 9.187 }}
            title="BA199"
            description="BA199"
          />
        </MapView>
      </View>
    )
  }

  renderold() {
    const { hasCameraPermission } = this.state
    let myview
    if (hasCameraPermission === null) {
      myview = <View />
    } else if (hasCameraPermission === false) {
      myview = <Text>No Access to Camera</Text>
    } else {
      myview = (
        <View style={{ flex: 1 }}>
          <Text>Hello</Text>
          <Camera style={{ flex: 1 }} type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row '
              }}>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center'
                }}
                onPress={() => {
                  this.setState({
                    type:
                      this.state.type === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back
                  })
                }}>
                <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      )
      return myview
    }

    return (
      <Container>
        <Header style={{ paddingLeft: 10, paddingTop: getStatusBarHeight(), height: 54 + getStatusBarHeight() }}>
          <Body>
            <Title>Welcome</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.doLogout()}>
              <Icon name="ios-log-out" />
            </Button>
          </Right>
        </Header>
        <Content>{myview}</Content>
      </Container>
    )
  }
}
export default connect(utils.mapStateToProps('hfo', ['login', 'users', 'meta', 'pickups']), utils.mapDispatchToProps)(
  CameraView
)

const stylesold = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between'
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Constants.statusBarHeight / 2
  },
  bottomBar: {
    paddingBottom: 5,
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    flex: 0.12,
    flexDirection: 'row'
  },
  noPermissions: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  autoFocusLabel: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  bottomButton: {
    flex: 0.3,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center'
  },
  newPhotosDot: {
    position: 'absolute',
    top: 0,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4630EB'
  },
  options: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    width: 200,
    height: 160,
    backgroundColor: '#000000BA',
    borderRadius: 4,
    padding: 10
  },
  detectors: {
    flex: 0.5,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row'
  },
  pictureQualityLabel: {
    fontSize: 10,
    marginVertical: 3,
    color: 'white'
  },
  pictureSizeContainer: {
    flex: 0.5,
    alignItems: 'center',
    paddingTop: 10
  },
  pictureSizeChooser: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  pictureSizeLabel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red'
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent'
  },
  row: {
    flexDirection: 'row'
  }
})
