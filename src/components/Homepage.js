import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  TouchableHighlight,
  Dimensions,
  StatusBar,
  AppState,
  AsyncStorage,
  Alert,
  DeviceEventEmitter,
  PermissionsAndroid,
  PushNotificationIOS,
  Platform,
} from 'react-native';

import { inject, observer } from 'mobx-react';
import { action, computed, observable, toJS } from 'mobx';
import RNFS from 'react-native-fs';
import RNBluetoothListener from 'react-native-bluetooth-listener';
import moment from 'moment';
import Permissions from 'react-native-permissions'
import Beacons from 'react-native-beacons-manager';
import fetch from 'react-native-fetch-polyfill';
import DeviceInfo from 'react-native-device-info';
import PushNotification from 'react-native-push-notification';
import { SafeAreaView } from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';

import I18n from './translate/i18n';
import checkIfFirstLaunch from '../config/checkIfFirstLaunch';

@inject('store')
@observer
export default class Homepage extends Component{

  // will be set as a reference to "beaconsDidRange" event:
  beaconsDidRangeEvent = null;
  beaconsServiceDidConnect: any = null;

  // will be set as a reference to "authorizationStatusDidChange" event:
  authStateDidRangeEvent = null;

  // VARIAVEIS
  @observable date_time = 0;
  @observable appState = AppState.currentState;
  @observable movtourBeacons = [];
  @observable closerBeacon = null;
  @observable beaconInUse = null;
  @observable visitedPOIs = [];
  @observable poisToDelete = [];

  // ACÇÕES
  @action setBeaconInUse(value){
    this.beaconInUse = value;
  }

  async componentDidMount(){
    if(Platform.OS === 'ios'){
      Beacons.requestAlwaysAuthorization();

      const firstLaunch = await checkIfFirstLaunch();
      if (!firstLaunch) {
        this.checkPermission();
      }
    }

    if(Platform.OS === 'android'){
      this.AndroidPermission(); // Lança um popup para o utilizador escolher se aceita ou não que a app utilize a localização do dispositivo.
    }

    RNBluetoothListener.getCurrentState().then(this.bluetoothInitialState);
    RNBluetoothListener.addEventListener('change', this.bluetoothStatus);

    AppState.addEventListener('change', this.handleAppStateChange); //Desperta um evento caso a aplicação mude de estado (primeiro plano / segundo plano)

    this.beaconsDidRangeEvent = Beacons.BeaconsEventEmitter.addListener('beaconsDidRange',(
      data: {
        beacons: Array<{distance: number, proximity: string, rssi: string, uuid: string}>,
        uuid: string,
        indetifier: string,
      }) => {

        console.log("Beacons detetados: ", data.beacons);

        if (data.beacons.length > 0){
          // console.log("Beacons detetados: ", data.beacons);

          let tempBeacon = data.beacons.find(x=> x.distance == Math.min(...data.beacons.map( y => y.distance)));
          console.log(`Beacon mais perto: ${tempBeacon.minor}; distancia: ${tempBeacon.distance}`);

          if (tempBeacon) {
            if(!this.closerBeacon || tempBeacon.distance < this.closerBeacon.distance){
              if (this.props.store.data.monuments){
                this.props.store.data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {

                  if (tempBeacon.minor == b.minor){
                    this.closerBeacon = {minor: tempBeacon.minor, monument:i, poi: j};
                  }
                })))

              }
            }
          }
        }
        //
        // if (this.appState.match(/active/)){
          if (this.date_time > Date.now()%5000 - 500 && this.date_time < Date.now()%5000 + 500) {
            console.log("Closer Beacon:", toJS(this.closerBeacon));
            this.openPOI();
          }

    });

    // Push Notifications settings
    PushNotification.configure({
      onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification );
        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    this.date_time = Date.now()%5000;
  } //fim do componentDidMount

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    RNBluetoothListener.removeEventListener('change', this.bluetoothStatus)
    this.stopRanging();
    this.beaconsDidRangeEvent.remove();
  }

  //Se o estado da app (foreground/background/inactive) mudar, atualizar a variável 'appState'
  handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.appState = nextAppState;
  }

  async startBeaconDetection(){
    try {
      await Beacons.addIBeaconsDetection()
    } catch (error) {
      console.log(`something went wrong during beacon detection initialization: ${error}`);
    }

    this.startRanging();
  }

  async startRanging(){
    const region = {
      identifier: 'Movtour',
      uuid: 'b68d864b-8fc5-4888-984a-4bdc7571fc95'
    }

    try {
      await Beacons.startRangingBeaconsInRegion(region);
      console.log('Beacons ranging started successfully');
    } catch (error) {
      throw error;
    }
  };

  async stopRanging(){
    const region = {
      identifier: 'Movtour',
      uuid: 'b68d864b-8fc5-4888-984a-4bdc7571fc95'
    }

    try {
      await Beacons.stopRangingBeaconsInRegion(region);
      console.log('Beacons stopped ranging successfully');
    } catch (error) {
      throw error;
    }
  }

  async AndroidPermission(){
    try {
        const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                'title': 'Location Permission',
                'message': 'We need access to your location so we can get beacon signals.'
            }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Location Permitted")
        } else {
            console.log("Location permission denied")
        }
    } catch (err) {
        console.warn(err)
    }
  }

  checkPermission(){
    Permissions.check('location', { type: 'always' }).then(response => {
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      console.log("Location Permission: ", response);

      if (response != 'authorized') {
        Alert.alert(
          'Location Permission',
          'There was a problem getting your permission. Please enable it from settings to detect Beacons.',
          [
            {text: "Open Settings", onPress: () => Permissions.openSettings()},
            {text: "Understood"}
          ]
        )
      }
    })
  }

  // Quando o estado do bluetooth é alterado
  bluetoothStatus = (state) => {
    let {connectionState} = state.type;
    console.log('Bluetooth ', connectionState);

    if (connectionState === 'on'){
      if(Platform.OS === 'android'){
        this.startBeaconDetection(); // Inicia a deteção de beacons;
      } else {
        this.startRanging(); // Inicia a procura de beacons
      }
    }
    if (connectionState === 'off'){
      this.stopRanging(); // Inicia a procura de beacons
      // this.beaconsDidRangeEvent.remove();
    }
  }

  // Verifica o estado do bluetooth quando a app é iniciada
  bluetoothInitialState = (state) => {
    let {connectionState} = state.type;
    console.log(connectionState);
    if (connectionState === 'off'){
      if(Platform.OS === 'android'){
        Alert.alert(
          I18n.t('alertBluetoothOffTitle'),
          I18n.t('alertBluetoothOffMsg'),
          [
            {text: I18n.t('alertBluetoothButtonTurnOn'), onPress: () => RNBluetoothListener.enable()},
            {text: I18n.t('alertBluetoothButtonUnderstand')}
          ],
        )
      } else {
        AlertIOS.alert(
          I18n.t('alertBluetoothOffTitle'),
          I18n.t('alertBluetoothOffMsg'),
          [
            {text: I18n.t('alertBluetoothButtonTurnOn'), onPress: () => RNBluetoothListener.enable()},
            {text: I18n.t('alertBluetoothButtonUnderstand')}
          ],
        )
      }

    } if (connectionState === 'on'){
      console.log("Bluetooth ligado: vai para o método startBeaconDetection");
      if(Platform.OS === 'android'){
        this.startBeaconDetection(); // Inicia a deteção de beacons;
      } else {
        this.startRanging(); // Inicia a procura de beacons
      }
    }
  }

  postFunction(k){
    fetch('http://movtour.ipt.pt/accesses', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // date: moment().format('YYYY-MM-D'),
        date: moment().format(),
        poi_id: k.id,
        nationality: DeviceInfo.getDeviceCountry(),
        id_device: DeviceInfo.getUniqueID(),
        os: DeviceInfo.getSystemName(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
      })
    })
  }

  postExitFromBeacon(beacon){
    fetch('http://movtour.ipt.pt/accesses/exit', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: moment().format(),
        uuid: beacon
      })
    })
  }

  openPOI(){
    const { navigate } = this.props.navigation;
    const { data } = this.props.store;

    if(this.beaconInUse){
      console.log("Beacon in Use:", toJS(this.beaconInUse));
    }

    // Abre o screen do beacon detectado.
    // Verifica se ja foi detectado algum beacon anteriormente (beaconInUse):
    // Se não foi, mostra o beacon mais perto (closerBeacon).
    // Se foi, verifica se o beacon mais perto é o beacon que está em uso. Se for o mesmo não faz nada, se não for mostra o screen desse beacon (POI).
    if(data.monuments && this.closerBeacon){
      if (this.beaconInUse == null || this.beaconInUse.poi.id != this.closerBeacon.poi.id) {
        // Define o beacon em uso
        this.setBeaconInUse(this.closerBeacon);

        // Faz um post
        this.postFunction(this.closerBeacon.poi);

        // PushNotification.localNotification({
        //   message: this.closerBeacon.poi.name
        // });

        // Vai para a pagina MonumentDetails OU se já lá estiver então faz re-render.
          navigate({
            routeName: 'MonumentDetails',
            params: {monumento:this.closerBeacon.monument, poi:this.closerBeacon.poi},
            key:'detail'
          });

        // Se o ponto ainda não foi visitado e se a app estiver em background (segundo plano)
        // então alerta o utilizador através de uma notificação
        if (this.appState.match(/inactive|background/) && !this.visitedPOIs.includes(this.closerBeacon.poi.id)){
            PushNotification.localNotification({
              message: this.closerBeacon.poi.name
            });
        }

        // Adiciona o ponto a um array para saber-mos que já foi visitado
        if(!this.visitedPOIs.includes(this.closerBeacon.poi.id)){
          this.visitedPOIs.push(this.closerBeacon.poi.id)
        }

      }

      if (this.beaconInUse.poi == this.closerBeacon.poi){
        this.setBeaconInUse(this.closerBeacon);
      }

      // Faz reset à variavel
      this.closerBeacon = null;
    }


  }

  render(){
    const { navigate } = this.props.navigation;
    const { data } = this.props.store;
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.listContainer}>
          {data.monuments.map(i => {
              return i.pois.map((j, index) => (
                <TouchableHighlight
                  onPress={() => navigate({
                      routeName: 'MonumentDetails',
                      params: { monumento:i, poi:j, swiperIndex:index, description_types:data.categories },
                      key:'detail',
                    })
                  }
                  style={styles.monumentoContainer}
                  key={index}
                >
                {j.cover_image_md5 != undefined ?
                  <ImageBackground style={styles.monumentoPic} source={{uri:`file://${RNFS.DocumentDirectoryPath}/images/${j.cover_image_md5}.jpg`}}>

                    {/* <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(40, 138, 189, 0.1)']} style={styles.monumentGradient}> */}

                      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']} style={styles.monumentoTitleContainer}>
                        <Text style={styles.monumentoTitle}>{j.name}</Text>
                      </LinearGradient>
                    {/* </LinearGradient> */}
                  </ImageBackground>
                  :
                  <ImageBackground style={styles.monumentoPic} source={require('../config/pictures/missing.jpg')}>
                    <View style={styles.monumentoTitleContainer}>
                      <Text style={styles.monumentoTitle}>{j.name}</Text>
                    </View>
                  </ImageBackground>
                }
                </TouchableHighlight>
              ))
          })}
        </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

}

const styles = StyleSheet.create({
	container:{
		flex: 1,

	},
  listContainer:{
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
	monumentoContainer:{
    margin: 5,
    width:(Dimensions.get('window').width / 2) - 20,
    height:(Dimensions.get('window').width) - 120,
    shadowColor: "#000",
    shadowOffset: {width: 0,height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
	},
	monumentoPic:{
    flex: 1,
    justifyContent: 'flex-end',
	},
	monumentoTitleContainer:{
    flexDirection:'row',
		height:100,
		alignItems:'flex-end',
    justifyContent:'center',
		paddingLeft:5,
		paddingRight:5,
    paddingBottom:5,
    flexWrap:'wrap',
	},
	monumentoTitle:{
		color:'white',
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: {width: -1, height: 1},
    // textShadowRadius: 2,
    textAlign: 'center',
	}
})
