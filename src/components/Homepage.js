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
} from 'react-native';

import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import RNFS from 'react-native-fs';
import { BluetoothStatus } from 'react-native-bluetooth-status';
// import Beacons from 'react-native-beacons-manager';
import fetch from 'react-native-fetch-polyfill';
import DeviceInfo from 'react-native-device-info';
import PushNotification from 'react-native-push-notification';
import { SafeAreaView } from 'react-navigation';

@inject('store')
@observer
export default class Homepage extends Component{

  // VARIAVEIS
  @observable date_time = 0;
  @observable appState = AppState.currentState;
  @observable movtourBeacons = [];
  @observable detectedBeacons = [];
  @observable closerBeacon = null;
  @observable beaconInUse = null;
  @observable visitedPOIs = [];
  @observable poisToDelete = [];

  // ACÇÕES
  @action setBeaconInUse(value){
    this.beaconInUse = value;
  }

  componentDidMount(){
    this.date_time = Date.now()%5000;
    // this.bluetoothCheck();

    // Beacons events
    // if(Platform.OS === 'android'){
    //   // Beacons.detectIBeacons();
    //   Beacons.addIBeaconsDetection();
    //
    //   Beacons.BeaconsEventEmitter.addListener('beaconServiceConnected',() => {
    //     console.log('service connected');
    //     // this.startRanging();
    //   });
    // }
    //
    // Beacons.BeaconsEventEmitter.addListener('beaconsDidRange',(response: {
    //     beacons: Array<{distance: number, proximity: string, rssi: string, uuid: string}>,
    //     uuid: string,
    //     indetifier: string,
    //   }) => { console.log('BEACONS: ', response) }
    // );

    // DeviceEventEmitter.addListener('beaconsDidRange',(data) => {
    //     // let date = moment().add(1000, 's');
    //     // Se for detectado algum beacon, verifica se é dos Movtour e encontra qual o mais próximo, adicionando-o à variável closerBeacon.
    //     console.log("Beacons detetados: ", data.beacons);
    //     if (data.beacons.length > 0){
    //       let movtourBeacons = data.beacons.filter(beacon => this.movtourBeacons.includes(beacon.uuid));
    //       this.detectedBeacons = movtourBeacons;
    //
    //       // Encontra o beacon que está mais perto
    //       let tempBeacon = movtourBeacons.find(x=> x.distance == Math.min(...movtourBeacons.map( y => y.distance)));
    //
    //       if (tempBeacon != null){
    //         console.log("Beacon mais perto:", tempBeacon.uuid, tempBeacon.distance);
    //       }
    //
    //       if(!this.closerBeacon || tempBeacon.distance < this.closerBeacon.distance){
    //         if (this.props.store.data.monuments !== undefined){
    //           this.props.store.data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {
    //
    //             if (tempBeacon.uuid == b.uuid){
    //               let poi_id = j.id;
    //               this.closerBeacon = {uuid: tempBeacon.uuid, poi: poi_id};
    //             }
    //           })))
    //
    //         }
    //       }
    //     } else { //Se não for detectado nada atualiza a variavel detectedBeacons
    //       this.detectedBeacons = null;
    //     }
    //
    //     if (this.appState.match(/inactive|background/)){
    //       if (this.date_time > Date.now()%5000 - 500 && this.date_time < Date.now()%5000 + 500) {
    //         this.sendNotification();
    //       }
    //     }
    //
    // });

    // X segundos em X segundos abre o openPOI
    // if (this.appState.match(/active/)){
    //   setInterval(() => {
    //     console.log(`Closer Beacon: ${this.closerBeacon}`);
    //     this.openPOI();
    //   }, 5000);
    // }

    AppState.addEventListener('change', this._handleAppStateChange);

    // Push Notifications settings
    PushNotification.configure({
      onNotification: function(notification) {
        AsyncStorage.getItem('@Data', (err, value) => {
          if (err) {
            console.log("Error getting Data: ", err);
          } else if (!value) {
              console.log("Key: @Data não possui dados");
          } else {
            const data = JSON.parse(value);
            data.monuments.map(i => i.pois.map((j, index) => {
              if (notification.message == j.name){
                navigate({
                  routeName: 'MonumentDetails',
                  params: {monumento:i, poi:j},
                  key:'detail'
                });
              }
            }))
          }
        });

      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  } //fim do componentDidMount

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  //Se o estado da app (foreground/background/inactive) mudar, atualizar a variável 'appState'
  _handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }

    this.appState = nextAppState;
    // this.setState({appState: nextAppState});
  }

  startRanging = async () => {
    try {
      await Beacons.startRangingBeaconsInRegion('Movtour', 'ed88a53a-1bc7-4ae4-8278-4ac82acd7722');
      console.log('Beacons ranging started successfully');
    } catch (error) {
      throw error;
    }
  };

  bluetoothCheck(){
    BluetoothStatus.state()
      .then((result) => {
          if (result == false) {
            Alert.alert(
              'Bluetooth desligado',
              'Se deseja que a aplicação o avise quando estiver perto de um Ponto de Interesse, ligue o Bluetooth. Obrigado.',
              [
                {text: 'Ligar Bluetooth', onPress: () => this.turnBluetoothOn()},
                {text: 'Compreendi'}
              ],
            )
          }
      })
  }

  turnBluetoothOn(){
    BluetoothStatus.enable(true)
      .catch(() => {
        Alert.alert(
          'Falhou a ligar o Bluetooth',
          'A aplicação não conseguiu ligar o Bluetooth.',
          [
            {text: 'Compreendi'},
          ],
        )
      })
  }

  getMovtourBeacons(){
    const { data } = this.props.store;
    // Cria um array com todos os beacons do Movtour
    if (data.monuments != undefined) {
      data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {
        this.movtourBeacons.push(b.uuid);
      })))
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

    if (this.beaconInUse != null){
      console.log("Beacon in Use:", this.beaconInUse);
    }
    if (this.closerBeacon != null){
      console.log("Closer Beacon:", this.closerBeacon);
    }

    // Abre o screen do beacon detectado.
    // Verifica se ja foi detectado algum beacon anteriormente (beaconInUse):
    // Se não foi, mostra o beacon mais perto (closerBeacon).
    // Se foi, verifica se o beacon mais perto é o beacon que está em uso. Se for o mesmo não faz nada, se não for mostra o screen desse beacon (POI).
    if(data.monuments !== undefined && this.closerBeacon != null){
        if (this.beaconInUse == null || this.beaconInUse.poi != this.closerBeacon.poi) {
          data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {
            if(b.uuid === this.closerBeacon.uuid){ // Identifica qual o POI associado a esse beacon.
              this.setBeaconInUse(this.closerBeacon);

              // Faz um post
              this.postFunction(j);

              navigate({
                routeName: 'MonumentDetails',
                params: {monumento:i, poi:j},
                key:'detail'
              });
            }
          })))
        }

        if (this.beaconInUse.poi == this.closerBeacon.poi){
          this.setBeaconInUse(this.closerBeacon);
        }

      // Faz reset à variavel
      this.closerBeacon = null;
    }


  }

  sendNotification(){
    const { data } = this.props.store;
    console.log("sendNotification()");
    if(data.monuments !== undefined){
      if (this.closerBeacon != null) {
        console.log("Entrou 0");
        if (this.beaconInUse == null || (this.beaconInUse.uuid != this.closerBeacon.uuid && this.beaconInUse.poi != this.closerBeacon.poi)) {
          console.log("Entrou 1");
          // Se o POI do closerBeacon não estiver nos visitados então entra aqui
          if (this.visitedPOIs.some(vP => vP.poi === this.closerBeacon.poi) === false) {

            data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {
              if (b.uuid === this.closerBeacon.uuid){ // Identifica qual o POI associado a esse beacon.
                this.setBeaconInUse(this.closerBeacon);
                this.visitedPOIs.push({poi: j.id})

                PushNotification.localNotification({
                  message: j.name
                });

                // Faz um post
                this.postFunction(j);
              }
            })))


          }
        } // fim do if (this.state.beaconInUse == null || (this.state.beac...
      }

        // Os POIS visitados que não estão presentes
        this.visitedPOIs.map((vP, vP_index) => {
          // Se um POI visitado não for igual ao POI do closerBeacon
          if (this.closerBeacon == null || this.closerBeacon.poi != vP.poi) {
            // Se esse POI ainda não estiver nos poiToDelete, então é adicionado
            if (this.poisToDelete.some(pDelete => pDelete.poi === vP.poi) === false) {
              this.poisToDelete.push({poi: vP.poi, date: moment().add(30, 's')})
              console.log("Vai ser adicionado à lista dos POIs para eliminar: ", vP.poi);
            } else { // Se esse POI já estiver nos poiToDelete então verifica há quanto tempo lá está
              this.poisToDelete.map((pDelete, pDelete_index) => {
                // Encontra esse beacon no array para apagar e verifica se já passou 30 seg.
                if (pDelete.poi === vP.poi && moment().isAfter(pDelete.date) ) {
                  console.log("Vai ser removido da lista dos POIs visitados: ", pDelete.poi);
                  this.poisToDelete.splice(pDelete_index, 1);
                  this.visitedPOIs.splice(vP_index, 1);
                  // Vai para a função que vai enviar um post a indicar que o utilizador saiu da zona do beacon 'X'
                  // this.postExitFromBeacon(pDelete.poi);
                }
              })
            }
          }
        })

        // Se algum beacon dos que está a ser detectado no momento estiver na lista dos beacons para apagar então
        // remove esse beacon da lista
        if (this.closerBeacon != null){
          this.poisToDelete.map((pDelete, pDelete_index) => {
            if (this.closerBeacon.poi == pDelete.poi) {
              console.log("Vai ser removido da lista temporária: ", pDelete.poi);
              this.poisToDelete.splice(pDelete_index, 1);
            }
          })
        }


        // Faz reset à variavel
        this.closerBeacon = null;

      } // fim do if undefined
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
                    <View style={styles.monumentoTitleContainer}>
                      <Text style={styles.monumentoTitle}>{j.name}</Text>
                    </View>
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
    elevation: 5,
	},
	monumentoPic:{
    flex: 1,
    justifyContent: 'flex-end',
	},
	monumentoTitleContainer:{
    flexDirection:'row',
		height:60,
		alignItems:'flex-end',
    justifyContent:'center',
		paddingLeft:5,
		paddingRight:5,
    paddingBottom:5,
    flexWrap:'wrap',
	},
	monumentoTitle:{
		color:'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 2,
    textAlign: 'center',
	}
})
