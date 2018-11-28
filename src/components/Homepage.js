import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
  DeviceEventEmitter,
  ListView,
  AsyncStorage,
  Alert,
  Button,
  BackHandler,
  AppState,
  Platform,
  PermissionsAndroid
} from 'react-native';

import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import { Icon } from 'react-native-elements';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';
// import Beacons from 'react-native-beacons-manager';
import DeviceInfo from 'react-native-device-info';
import fetch from 'react-native-fetch-polyfill';
import RNFS from 'react-native-fs';
import * as Progress from 'react-native-progress';
import Display from 'react-native-display';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import ActionButton from 'react-native-action-button';
import I18n from './translate/i18n';
import Flag from 'react-native-round-flags';
import RNExitApp from 'react-native-exit-app';
// import requestFineLocationPermission from './requestFineLocationPermission';

@inject('store')
@observer
export default class Homepage extends Component {
  // VARIABLES
  @observable showProgressCircle= true;
  @observable progressCircle= 0;
  @observable showSpinner = true;
  @observable willDownload = false;
  @observable appState = AppState.currentState;
  @observable movtourBeacons = [];
  @observable totalImages = 0;
  @observable imagesDownloaded = 0;
  @observable detectedBeacons = [];
  @observable closerBeacon = null;
  @observable beaconInUse = null;
  @observable visitedPOIs = [];
  @observable poisToDelete = [];
  @observable date_time = 0;


  // ACTIONS
  @action.bound incrementTotalImages(){
    this.totalImages++;
  }

  @action.bound incrementImagesDownloaded(){
    this.imagesDownloaded++;
  }

  @action setBeaconInUse(value){
    this.beaconInUse = value;
  }

  componentWillMount() {
    RNFS.mkdir(RNFS.DocumentDirectoryPath+ '/images/');
    // Para limpar os dados guardados no AsyncStorage, descomentar a próxima linha.
    // AsyncStorage.clear();
    console.log(Platform.Version);
  }

  async componentDidMount(){
    const {navigate} = this.props.navigation;
    this.date_time = Date.now()%5000;
    // -- FETCHING DATA ---------------------------------------------- FETCHING DATA --
    fetch('http://movtour.ipt.pt/monuments.json', {timeout: 10 * 1000})
      .then(res => res.json())
      .then(res => {
        if(res.status == 500) {
          console.log("-----------------------------------Erro 500----------------------------------------");
          Alert.alert(
            'Falha na recolha de dados',
            'Pedimos desculpa, mas de momento o servidor não está a enviar os dados correctos. A aplicação vai tentar usar os dados guardados em memória. Obrigado.',
            [
              {text: 'Compreendi'},
            ],
          )
          this.getSavedData();
        } else {
          this.props.store.setData(res)
          this.deleteImages();
          this.saveImages();
        }
      })
      .catch((error) => {
        this.getSavedData();
        console.log("Erro no fetch dos dados!", error);
      })

      //Verifica se o Bluetooth está ligado
      this.isBluetoothOn();

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

  } //Fim do componentDidMount

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  startRanging = async () => {
    try {
      await Beacons.startRangingBeaconsInRegion('Movtour', 'ed88a53a-1bc7-4ae4-8278-4ac82acd7722');
      console.log('Beacons ranging started successfully');
    } catch (error) {
      throw error;
    }
  };

  //Se o estado da app (foreground/background/inactive) mudar, atualizar a variável 'appState'
  _handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }

    this.appState = nextAppState;
    // this.setState({appState: nextAppState});
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

  deleteImages(){
    const { data } = this.props.store;
    return (
      RNFS.readDir(`${RNFS.DocumentDirectoryPath}/images/`)
      .then( result => {
        // console.log('RNFS dir:', result);
        if (result.length){
          result.map((r, index) => {
            let sum = false;
            let imgMonuments = data.monuments.filter(i => (`${i.cover_image_md5}.jpg`) === r.name);
            let imgPois = data.monuments.map(i => i.pois.filter(j => (`${j.cover_image_md5}.jpg`) === r.name));

            if (imgMonuments.length > 0) {
              sum = true
            }

            imgPois.map(pois => {
              if (pois.length > 0) {
                sum = true
              }
            })

            if (sum == false) {
              RNFS.unlink(r.path)
                .then(() => {
                  console.log('FILE DELETED: ', r.name);
                })
                // `unlink` will throw an error, if the item to unlink does not exist
                .catch((err) => {
                  console.log('Erro a apagar as imagens:', err.message);
                });
            }

          }) //fim do result.map
        } //fim do if
      }) //fim do .then(result)

    ) //fim do return
  } //fim do deleteImages

  saveImages(){
    const { data } = this.props.store;
    const x = data.monuments.length-1;
    const y = data.monuments[x].pois.length-1;
    let promises = [];
    data.monuments.map((i) => {
      promises.push(this.getMonumentImages(i));
      i.pois.map((k) => {
        promises.push(this.getPoiImages(k));
      });
    });

    Promise.all(promises).then(
      ()=>{
        // So entra aqui se já tiver percorrido todo o array (data) e não houver downloads para fazer
        if(this.willDownload == false){
          this.showSpinner = false;
          this.showProgressCircle = false;
          this.getMovtourBeacons();
        }
      }, error => console.log("ERRRRO: ", error));

  } //fim do saveImages

  getMonumentImages(i){
    return new Promise((resolve, reject)=>{
      if (i.cover_image_md5 != undefined) {

      RNFS.exists(`${RNFS.DocumentDirectoryPath}/images/${i.cover_image_md5}.jpg`)
        .then( success => {
          if (success == false){ // Se a imagem ainda não existir
            console.log("Vai gravar a imagem do monumento: ", i.cover_image_md5);
            this.incrementTotalImages();
            this.willDownload = true;
            this.showSpinner = false;
            RNFS.downloadFile({
              fromUrl: i.cover_image,
              toFile: `${RNFS.DocumentDirectoryPath}/images/${i.cover_image_md5}.jpg`
            }).promise.then(r => {
                console.log('Resposta ao guardar imagem do monumento: ', r);
                this.incrementImagesDownloaded();
                this.progressCircle = this.imagesDownloaded/this.totalImages;
                if(this.imagesDownloaded >= this.totalImages-1){
                  this.showProgressCircle = false;
                  this.willDownload = false;
                  this.getMovtourBeacons();
                }
                resolve();
              })
              .catch((error) => {
                console.log("Erro ao descarregar imagem do monumento: ", error);
                resolve();
              })
          } else resolve();
        })
        .catch((err) => {
          console.log('Erro a salvar as imagens dos Monumentos: ', err);
          resolve();
        });
      } else resolve();
    });
  }

  getPoiImages(k){
    return new Promise((resolve,reject)=>{
      if (k.cover_image_md5 != undefined) {
        RNFS.exists(`${RNFS.DocumentDirectoryPath}/images/${k.cover_image_md5}.jpg`)
          .then((success) => {
            if (success == false){
              console.log("Vai gravar a imagem do poi: ", k.cover_image_md5);
              this.incrementTotalImages();
              this.willDownload = true;
              this.showSpinner = false;
              RNFS.downloadFile({
                fromUrl: k.cover_image,
                toFile: `${RNFS.DocumentDirectoryPath}/images/${k.cover_image_md5}.jpg`
              }).promise.then(r => {
                console.log('Resposta ao guardar imagem do poi: ', r);
                this.incrementImagesDownloaded();
                this.progressCircle = this.imagesDownloaded/this.totalImages;
                if(this.imagesDownloaded >= this.totalImages-1){
                  this.showProgressCircle = false;
                  this.willDownload = false;
                  this.getMovtourBeacons();
                }
                resolve();
                })
                .catch((error) => {
                  console.log("Erro ao descarregar imagem do PoI. ", error);
                  resolve();
                })
            } else resolve();
          })
          .catch((err) => {
            console.log('Erro a salvar as imagens dos PoIs. ', err);
            resolve();
          });
      } else resolve();
    });
  }

  getSavedData(){
    return (
      AsyncStorage.getItem('@Data',(err, dados) => {
        if(err) {
          console.error('Error loading monuments', err)
        } else {
          if(!dados){
            console.log('Os dados estão vazios');
            Alert.alert(
              'Dados insuficientes',
              'Por favor reinicie a aplicação e ligue a internet para a aplicação descarregar os dados necessários. Obrigado.',
              [
                {text: 'Ok, fechar aplicação.', onPress: () => RNExitApp.exitApp()},
              ],
            )
          } else {
            console.log('Vai carregar os dados que estão na memória')
            // data = JSON.parse(dados);
            this.props.store.data = JSON.parse(dados);
            this.showProgressCircle = false;
            this.showSpinner = false;
            this.getMovtourBeacons();
          }
        }
      })
    )
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

  // newNotification(){
  //
  //   if(this.state.data.monuments !== undefined){
  //
  //     this.state.detectedBeacons.map(beacon => {
  //         //O beacon ainda não tinha sido detectado?
  //         if (this.state.visitedBeacons.some(vB => vB.uuid === beacon.uuid) === false) {
  //
  //           // Encontra o Poi que contém este beacon
  //           this.state.data.monuments.map(i => i.pois.map((j, index) => {
  //             if(j.beacon.uuid === beacon.uuid){
  //
  //               // Envia notificação
  //               PushNotification.localNotification({
  //                   message: j.name
  //               });
  //
  //               // Faz um post
  //               this.postFunction(j);
  //             }
  //           }))
  //
  //           // Adiciona este beacon aos beacons detectados
  //           this.setState({
  //             visitedBeacons: [...this.state.visitedBeacons, {uuid: beacon.uuid}]
  //           })
  //
  //         }
  //     })
  //
  //     this.state.visitedBeacons.map((vB, vB_index) => {
  //       //Algum beacon já visitados não está a ser detectado?
  //       if (this.state.detectedBeacons.some(beacon => beacon.uuid === vB.uuid) === false) {
  //         // Se esse beacon não estiver na tabela beaconsToDelete então adiciona-o.
  //         if (this.state.beaconsToDelete.some(bDelete => bDelete.uuid === vB.uuid) === false) {
  //           // console.log("Vai adicionar à lista temporária: ", vB.uuid);
  //           this.setState({
  //             beaconsToDelete: [...this.state.beaconsToDelete, {uuid: vB.uuid, date: moment().add(30, 's')}]
  //           })
  //         } else { //Se já estiver vai ver à quanto tempo está lá
  //           this.state.beaconsToDelete.map((bDelete, bDelete_index) => {
  //             // Encontra esse beacon no array para apagar e verifica se já passou 30 seg.
  //             if (bDelete.uuid === vB.uuid && moment().isAfter(bDelete.date) ) {
  //               console.log("Vai ser removido da lista dos visitados: ", bDelete.uuid);
  //               this.state.beaconsToDelete.splice(bDelete_index, 1);
  //               this.state.visitedBeacons.splice(vB_index, 1);
  //               this.setState({
  //                 beaconsToDelete: this.state.beaconsToDelete,
  //                 visitedBeacons: this.state.visitedBeacons
  //               })
  //               // Vai para a função que vai enviar um post a indicar que o utilizador saiu da zona do beacon 'X'
  //               this.postExitFromBeacon(bDelete.uuid);
  //             }
  //           })
  //         }
  //
  //       }
  //     })
  //
  //     // Se algum beacon dos que está a ser detectado no momento estiver na lista dos beacons para apagar então
  //     // remove esse beacon da lista
  //     this.state.beaconsToDelete.map((bDelete, bDelete_index) => {
  //       if (this.state.detectedBeacons.some(beacon => beacon.uuid === bDelete.uuid ) === true) {
  //         console.log("Vai ser removido da lista temporária: ", bDelete.uuid);
  //         this.state.beaconsToDelete.splice(bDelete_index, 1);
  //         this.setState({
  //           beaconsToDelete: this.state.beaconsToDelete
  //         })
  //       }
  //     })
  //   }
  //
  // }

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

  isBluetoothOn(){
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

  showButtons(){
    if (this.showProgressCircle == false && this.showSpinner == false) {
      return true
    } else {
      return false
    }
  }

  render(){
    const { navigate } = this.props.navigation;
    const { data, locale } = this.props.store;
    const window = Dimensions.get('window');
    // console.log("DADOS: ", data);
    // console.log("Movtour Beacons: ", this.movtourBeacons);
    // console.log('Images Downloaded: ', this.imagesDownloaded);
    // console.log('Total of Images: ', this.totalImages);
    // console.log('Progress: ', this.progressCircle);
    // console.log('Show Progress: ', this.showProgressCircle);
    // console.log('Spinner: ', this.showSpinner);

    return (
      <ImageBackground source={require('../config/pictures/tomar_centro.jpg')} style={styles.container}>

        <View style={styles.titulo}>
          <Text style={styles.tituloText}><Text style={styles.titutoTextM}>M</Text>ovtour</Text>
        </View>

        <View style={styles.progressCircle}>
          <Display enable={this.showProgressCircle}>
            <Progress.Circle
              progress={Number(this.progressCircle)}
              color={'white'}
              borderWidth={4}
              borderColor={'white'}
              size={Dimensions.get('window').width/2}
              thickness={8}
              indeterminate={this.showSpinner}
              formatText={() => (this.progressCircle * 100).toFixed(0) + '%'}
              showsText={true}
              textStyle={{color: 'white'}}
            />
          </Display>
        </View>


        <View style={styles.contentContainer}>
          <Display enable={this.showButtons()}>
            <View style={styles.buttonContent}>
              <TouchableHighlight
                onPress={() => navigate('MultiPointMap', {data:data})}
                style={styles.button}
                underlayColor='#075e54'
              >
                <View>
                  <Icon
                    name='place'
                    color='#fff'
                    size={34}
                  />
                  <Text style={styles.buttonText}>{I18n.t('map').toUpperCase()}</Text>
                </View>
              </TouchableHighlight>

              <TouchableHighlight
                onPress={() => navigate('Monument', {data:data})}
                style={styles.button}
                underlayColor='#075e54'
              >
                <View>
                  <Icon
                    name='account-balance'
                    color='#fff'
                    size={34}
                  />
                  <Text style={styles.buttonText}>{I18n.t('monuments').toUpperCase()}</Text>
                </View>
              </TouchableHighlight>
            </View>
          </Display>
        </View>
      </ImageBackground>
    );
  }



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    width: null,
    height: null,
  },

  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white'
  },

  flag: {
    height: 56,
    width: 56
  },

  titulo:{
    flex:2,
    marginTop:30,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  tituloText:{
    fontSize: 90,
    fontWeight: '100',
    // fontFamily: 'sans-serif-light',
    color: 'white',
    textShadowColor:'#252525',
    textShadowOffset:{width:2, height:2},
    textShadowRadius: 15,
  },

  titutoTextM:{
    color: 'rgba(7, 94, 84, 0.7)',
    textShadowOffset:{width:3, height:3}
  },

  progressCircle:{
    flex:2,
    justifyContent: 'center',
    alignItems:'center',
    alignSelf:'center',
  },


  contentContainer:{
    flex:1,
    justifyContent:'flex-end',
  },

  buttonContent:{
    flex:1,
    flexDirection:'row',
    alignSelf:'stretch',
    alignItems:'flex-end',
    justifyContent:'center',
    margin:5,
  },

  button:{
    flex:1,
    backgroundColor:'rgba(7, 94, 84, 0.7)',
    alignItems:'center',
    justifyContent:'center',
    borderWidth: 2,
    borderColor: '#075e54',
    elevation: 10,
    height:100,
    margin: 10,
  },

  buttonText:{
    fontSize: 20,
    fontWeight: '100',
    // fontFamily: 'sans-serif-light',
    color: 'white',
    marginTop: 10
  },

  text:{
    color:'#fff',
    fontSize: 24,
    fontWeight: 'normal',
    textAlign: 'center',
    // fontFamily: 'sans-serif-light',
  },

	dscpContainer: {
		flex:1,
    flexDirection:'row',
    justifyContent:'center',
		flexWrap:'wrap',
		margin: 3
	},

	dscpButton: {
		width: '45%',
    backgroundColor:'rgba(7, 94, 84, 0.7)',
    alignItems:'center',
    justifyContent:'center',
    borderWidth: 2,
    borderColor: '#075e54',
    elevation: 10,
    height:100,
    margin: 5,
	},

	dscpText: {
		fontSize: 18,
    fontWeight: '100',
    // fontFamily: 'sans-serif-light',
    color: 'white'
	}

});
