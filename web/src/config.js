var config

export default (config = {
  SERVER_IP: 'https://live.hfoinc.in',
  google: {
    // obtained from Google Console -- Steps defined in https://docs.expo.io/versions/latest/sdk/google
    // right now using rsmoorthy@gmail.com credentials. Need to move to support@hfoinc.in
    androidClientId: '909169879659-uqivbnfl7skva1g7a3b9uf5h3r3i3gp4.apps.googleusercontent.com',
    androidStandaloneAppClientId: '909169879659-vfalijup5p1aj3i2il55bue2ghth4mib.apps.googleusercontent.com',
    googlePlacesAPIKey: 'AIzaSyD9lil843268pc0nWMTHfn_nlO_pZAXVXQ',
    googleMapsAPIKey: 'AIzaSyDfB1nLil1S_zFrMtFz60BQMRn0m7HFltI'
  }
})
