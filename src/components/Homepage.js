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
  Platform
} from 'react-native';

import { inject, observer } from 'mobx-react';
import { Icon } from 'react-native-elements';                         //done
import moment from 'moment';                                          //done
import PushNotification from 'react-native-push-notification';        //done
import Beacons  from 'react-native-beacons-manager';                  //done
import DeviceInfo from 'react-native-device-info';                    //done
import fetch from 'react-native-fetch-polyfill';                      //done
import RNFS from 'react-native-fs';                                   //done but without testing
import * as Progress from 'react-native-progress';                    //done
import Display from 'react-native-display';                           //done
import { BluetoothStatus } from 'react-native-bluetooth-status';      //done
import ActionButton from 'react-native-action-button';
import I18n from './translate/i18n';
import Flag from 'react-native-round-flags';                          //done
import RNExitApp from 'react-native-exit-app';                        //done

@inject('store')
@observer
export default class Homepage extends Component {

  state = {
    showProgressBar: true,
    totalOfImages:0,
    imagesDownloaded:0,
    progressBar:0,
    showSpinner: true,
    willDownload: false,
    movtourBeacons: [],
    detectedBeacons: [],
    visitedBeacons: [],
    beaconsToDelete: [],
    visitedPOIs: [],
    poisToDelete: [],
    beaconInUse:null,
    closerBeacon:null,
    data: [],
    homepageKey: '',
    appState: AppState.currentState,
    date_time: 0,
  }

  componentWillMount() {
    RNFS.mkdir(RNFS.DocumentDirectoryPath+ '/images/');
    // Beacons.requestWhenInUseAuthorization();
    // Beacons.requestAlwaysAuthorization();

    // if(Platform.OS === 'android'){
      // Beacons.detectIBeacons();
    // }

    // Beacons.startUpdatingLocation();
    // Beacons.setBackgroundScanPeriod(3´0000);

    // Beacons
    //   .startMonitoringForRegion({identifier: 'Tomar', uuid:null})
    //   .then(() => console.log('Beacons monitoring started succesfully'))
    //   .catch(error => console.log(`Beacons ranging not started, error: ${error}`));
    //
    // Beacons
      // .startRangingBeaconsInRegion({identifier: 'Tomar', uuid:null})
    //   .then(() => console.log('Beacons ranging started succesfully'))
    //   .catch(error => console.log(`Beacons ranging not started, error: ${error}`));

    //Vai buscar a linguagem à memória
    // AsyncStorage.getItem('@Language', (err, value) => {
		// 	if (err) {
		// 		console.log("Error getting Language: ", err);
		// 	} else if (!value) {
		// 			console.log("Key: @Language não possui dados");
		// 	} else {
    //     I18n.locale = JSON.parse(value);
		// 	}
		// });
  }

  componentDidMount(){
    const {navigate} = this.props.navigation;

    //Guardar chave da componente
    this.setState({
      homepageKey: this.props.navigation.state.key,
      date_time: Date.now()%5000
    });

    // -- FETCHING DATA ---------------------------------------------- FETCHING DATA --
    fetch('http://movtour.ipt.pt/monuments.json', {timeout: 10 * 1000})
    // fetch('http://movtour.ipt.pt/monuments.json', {timeout: 10 * 1000})
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
          this.setState({data: res})
          // Vai guardar os dados na memória do telemóvel
          try {
            AsyncStorage.setItem('@Data', JSON.stringify(res));
            console.log("@Data saved");
          } catch (error) {
            console.log("Error saving data -> " + error);
          }
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
      DeviceEventEmitter.addListener('beaconsDidRange',(data) => {
          // let date = moment().add(1000, 's');
          // Se for detectado algum beacon, verifica se é dos Movtour e encontra qual o mais próximo, adicionando-o à variável closerBeacon.
          if (data.beacons.length > 0){
            let movtourBeacons = data.beacons.filter(beacon => this.state.movtourBeacons.includes(beacon.uuid));
            this.setState({detectedBeacons: movtourBeacons});

            // Encontra o beacon que está mais perto
            let tempBeacon = movtourBeacons.find(x=> x.distance == Math.min(...movtourBeacons.map( y => y.distance)));

            // if (tempBeacon != null){
            //   console.log("Beacon mais perto:", tempBeacon.uuid, tempBeacon.distance);
            // }

            // movtourBeacons.map(x => {
            //   this.state.data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {
            //     if (this.state.beaconInUse.poi == j && b.uuid == x.uuid){
            //       if (x.distance < tempBeacon.distance + 1){
            //         tempBeacon = x;
            //
            //     }
            //   })))
            // })


            if(!this.state.closerBeacon || tempBeacon.distance < this.state.closerBeacon.distance){
              if (this.state.data.monuments !== undefined){
                this.state.data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {

                  if (tempBeacon.uuid == b.uuid){
                    let poi_id = j.id;
                    this.setState({
                      closerBeacon:{uuid: tempBeacon.uuid, poi: poi_id}
                    });
                  }
                })))

              }
            }
          } else { //Se não for detectado nada atualiza a variavel detectedBeacons
            this.setState({detectedBeacons: null});
          }

          if (this.state.appState.match(/inactive|background/)){
            if (this.state.date_time > Date.now()%5000 - 500 && this.state.date_time < Date.now()%5000 + 500) {
              this.sendNotification();
            }
          }

      });

      // X segundos em X segundos abre o openPOI
      if (this.state.appState.match(/active/)){
        setInterval(() => {
          this.openPOI();
        }, 5000);
      }

      // DeviceEventEmitter.addListener('regionDidEnter',(dataEnter) => {
      //   console.log('monitoring - regionDidEnter data: ', dataEnter);
      // });
      //
      // DeviceEventEmitter.addListener('regionDidExit',(dataExit) => {
      //   console.log('monitoring - regionDidExit data: ', dataExit);
      // });

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
                    params: {monumento:i, poi:j, description_types:data.categories, data:data},
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

  //Se o estado da app (foreground/background/inactive) mudar, atualizar a variável 'appState'
  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }

    this.setState({appState: nextAppState});
  }

  getMovtourBeacons(){
    // Cria um array com todos os beacons do Movtour
    if (this.state.data.monuments != undefined) {
      this.state.data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {
        this.setState({
          movtourBeacons: [...this.state.movtourBeacons, b.uuid]
        })
      })))
    }
  }

  deleteImages(){
    console.log('DATA: ', this.state.data);
    return (
      RNFS.readDir(RNFS.DocumentDirectoryPath + '/images/')
      .then( result => {
        // console.log('RNFS dir:', result);
        if (result.length){
          result.map((r, index) => {
            let sum = false;
            let imgMonuments = this.state.data.monuments.filter(i => (i.cover_image_md5 + '.jpg') === r.name);
            let imgPois = this.state.data.monuments.map(i => i.pois.filter(j => (j.cover_image_md5 + '.jpg') === r.name));

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
    const x = this.state.data.monuments.length-1;
    const y = this.state.data.monuments[x].pois.length-1;
    // console.log("x: ", x, "; y:", y);
    return (
      this.state.data.monuments.map((i, indexMonuments) => {
        if (i.cover_image_md5 != undefined) {

        RNFS.exists(RNFS.DocumentDirectoryPath + '/images/' + i.cover_image_md5 + '.jpg')
          .then( success => {
            if (success == false){ // Se a imagem ainda não existir
              console.log("Vai gravar a imagem do monumento: ", i.cover_image_md5);
              this.setState({totalOfImages: this.state.totalOfImages+1, willDownload: true, showSpinner:false})
              RNFS.downloadFile({
                fromUrl: i.cover_image,
                toFile: `${RNFS.DocumentDirectoryPath}/images/`+ i.cover_image_md5 + `.jpg`,
              }).promise.then(r => {
                  console.log('Resposta ao guardar imagem do monumento: ', r);
                  this.setState({
                    imagesDownloaded: this.state.imagesDownloaded+1,
                    progressBar:this.state.imagesDownloaded/this.state.totalOfImages
                  })
                  if(this.state.imagesDownloaded >= this.state.totalOfImages-1){
                    this.setState({showProgressBar:false, willDownload: false})
                    this.getMovtourBeacons();
                  }
                })
                .catch((error) => {
                  console.log("Erro ao descarregar imagem do monumento: ", error);
                })
            }
          })
          .catch((err) => {
            console.log('Erro a salvar as imagens dos Monumentos: ', err);
          });

        }

        i.pois.map((k, indexPois) => {
          if (k.cover_image_md5 != undefined) {
            RNFS.exists(RNFS.DocumentDirectoryPath + '/images/' + k.cover_image_md5 + '.jpg')
              .then((success) => {
                if (success == false){
                  console.log("Vai gravar a imagem do poi: ", k.cover_image_md5);
                  this.setState({totalOfImages: this.state.totalOfImages+1, willDownload: true, showSpinner:false})
                  RNFS.downloadFile({
                    fromUrl: k.cover_image,
                    toFile: `${RNFS.DocumentDirectoryPath}/images/`+ k.cover_image_md5 + `.jpg`,
                  }).promise.then(r => {
                    console.log('Resposta ao guardar imagem do poi: ', r);
                    this.setState({
                      imagesDownloaded: this.state.imagesDownloaded+1,
                      progressBar:this.state.imagesDownloaded/this.state.totalOfImages
                    })
                    if(this.state.imagesDownloaded >= this.state.totalOfImages-1 ){
                      this.setState({showProgressBar:false, willDownload: false})
                      this.getMovtourBeacons();
                    }
                    })
                    .catch((error) => {
                      console.log("Erro ao descarregar imagem do poi: ", error);
                    })
                }




              })
              .catch((err) => {
                console.log('Erro a salvar as imagens dos Pois: ', err);
              });
          }
          // console.log("indexMonuments: ", indexMonuments, "; indexPois: ", indexPois, "; poi: ", k.name);
          // So entra aqui se já tiver percorrido todo o array (data) e não houver downloads para fazer
          if(indexMonuments==x && indexPois==y && this.state.willDownload == false){
            this.setState({showSpinner:false, showProgressBar: false})
            this.getMovtourBeacons();
          }

        })


      })
    );
  } //fim do saveImages

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
            const monuments = JSON.parse(dados)
            this.setState({
              data: monuments,
              showProgressBar: false,
              showSpinner: false,
            })
            this.getMovtourBeacons();
          }
        }
      })
    )
  }

  openPOI(){
    const { navigate, replace } = this.props.navigation;

    if (this.state.beaconInUse != null){
      console.log("Beacon in Use:", this.state.beaconInUse);
    }
    if (this.state.closerBeacon != null){
      console.log("Closer Beacon:", this.state.closerBeacon);
    }

    // Abre o screen do beacon detectado.
    // Verifica se ja foi detectado algum beacon anteriormente (beaconInUse):
    // Se não foi, mostra o beacon mais perto (closerBeacon).
    // Se foi, verifica se o beacon mais perto é o beacon que está em uso. Se for o mesmo não faz nada, se não for mostra o screen desse beacon (POI).
    if(this.state.data.monuments !== undefined && this.state.closerBeacon != null){
        if (this.state.beaconInUse == null || this.state.beaconInUse.poi != this.state.closerBeacon.poi) {
          this.state.data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {
            if(b.uuid === this.state.closerBeacon.uuid){ // Identifica qual o POI associado a esse beacon.
              this.setState({
                beaconInUse:this.state.closerBeacon
              });

              // Faz um post
              this.postFunction(j);

              navigate({
                routeName: 'MonumentDetails',
                params: {monumento:i, poi:j, description_types:this.state.data.categories, data:this.state.data},
                key:'detail'
              });
            }
          })))
        }

        if (this.state.beaconInUse.poi == this.state.closerBeacon.poi){
          this.setState({
            beaconInUse:this.state.closerBeacon
          });
        }

      // Faz reset à variavel
      this.setState({closerBeacon:null});
    }


  }

  sendNotification(){
    console.log("sendNotification()");
    if(this.state.data.monuments !== undefined){
      if (this.state.closerBeacon != null) {
        console.log("Entrou 0");
        if (this.state.beaconInUse == null || (this.state.beaconInUse.uuid != this.state.closerBeacon.uuid && this.state.beaconInUse.poi != this.state.closerBeacon.poi)) {
          console.log("Entrou 1");
          // Se o POI do closerBeacon não estiver nos visitados então entra aqui
          if (this.state.visitedPOIs.some(vP => vP.poi === this.state.closerBeacon.poi) === false) {

            this.state.data.monuments.map(i => i.pois.map(j => j.beacons.map(b => {
              if (b.uuid === this.state.closerBeacon.uuid){ // Identifica qual o POI associado a esse beacon.

                this.setState({
                  beaconInUse:this.state.closerBeacon,
                  visitedPOIs: [...this.state.visitedPOIs, {poi: j.id}]
                });

                PushNotification.localNotificationSchedule({
                  message: j.name, // (required)
                  date: new Date(Date.now())
                });

                // Faz um post
                this.postFunction(j);
              }
            })))


          }
        } // fim do if (this.state.beaconInUse == null || (this.state.beac...
        }

        // Os POIS visitados que não estão presentes
        this.state.visitedPOIs.map((vP, vP_index) => {
          // Se um POI visitado não for igual ao POI do closerBeacon
          console.log("Entrou 2");
          if (this.state.closerBeacon == null || this.state.closerBeacon.poi != vP.poi) {
            console.log("#########");
            // Se esse POI ainda não estiver nos poiToDelete, então é adicionado
            if (this.state.poisToDelete.some(pDelete => pDelete.poi === vP.poi) === false) {
              this.setState({
                poisToDelete: [...this.state.poisToDelete, {poi: vP.poi, date: moment().add(30, 's')}]
              })
              console.log("Vai ser adicionado à lista dos POIs para eliminar: ", vP.poi);
            } else { // Se esse POI já estiver nos poiToDelete então verifica há quanto tempo lá está
              this.state.poisToDelete.map((pDelete, pDelete_index) => {
                // Encontra esse beacon no array para apagar e verifica se já passou 30 seg.
                if (pDelete.poi === vP.poi && moment().isAfter(pDelete.date) ) {
                  console.log("Vai ser removido da lista dos POIs visitados: ", pDelete.poi);
                  this.state.poisToDelete.splice(pDelete_index, 1);
                  this.state.visitedPOIs.splice(vP_index, 1);
                  this.setState({
                    poisToDelete: this.state.poisToDelete,
                    visitedPOIs: this.state.visitedPOIs
                  })
                  // Vai para a função que vai enviar um post a indicar que o utilizador saiu da zona do beacon 'X'
                  // this.postExitFromBeacon(pDelete.poi);
                }
              })
            }
          }
        })

        // Se algum beacon dos que está a ser detectado no momento estiver na lista dos beacons para apagar então
        // remove esse beacon da lista
        if (this.state.closerBeacon != null){
          this.state.poisToDelete.map((pDelete, pDelete_index) => {
            console.log("Entrou 3");
            if (this.state.closerBeacon.poi == pDelete.poi) {
              console.log("Vai ser removido da lista temporária: ", pDelete.poi);
              this.state.poisToDelete.splice(pDelete_index, 1);
              this.setState({
                poisToDelete: this.state.poisToDelete
              })
            }
          })
        }


        // Faz reset à variavel
        this.setState({closerBeacon:null});



      } // fim do if undefined
  }

  newNotification(){

    if(this.state.data.monuments !== undefined){

      this.state.detectedBeacons.map(beacon => {
          //O beacon ainda não tinha sido detectado?
          if (this.state.visitedBeacons.some(vB => vB.uuid === beacon.uuid) === false) {

            // Encontra o Poi que contém este beacon
            this.state.data.monuments.map(i => i.pois.map((j, index) => {
              if(j.beacon.uuid === beacon.uuid){

                // Envia notificação
                PushNotification.localNotification({
                    message: j.name
                });

                // Faz um post
                this.postFunction(j);
              }
            }))

            // Adiciona este beacon aos beacons detectados
            this.setState({
              visitedBeacons: [...this.state.visitedBeacons, {uuid: beacon.uuid}]
            })

          }
      })

      this.state.visitedBeacons.map((vB, vB_index) => {
        //Algum beacon já visitados não está a ser detectado?
        if (this.state.detectedBeacons.some(beacon => beacon.uuid === vB.uuid) === false) {
          // Se esse beacon não estiver na tabela beaconsToDelete então adiciona-o.
          if (this.state.beaconsToDelete.some(bDelete => bDelete.uuid === vB.uuid) === false) {
            // console.log("Vai adicionar à lista temporária: ", vB.uuid);
            this.setState({
              beaconsToDelete: [...this.state.beaconsToDelete, {uuid: vB.uuid, date: moment().add(30, 's')}]
            })
          } else { //Se já estiver vai ver à quanto tempo está lá
            this.state.beaconsToDelete.map((bDelete, bDelete_index) => {
              // Encontra esse beacon no array para apagar e verifica se já passou 30 seg.
              if (bDelete.uuid === vB.uuid && moment().isAfter(bDelete.date) ) {
                console.log("Vai ser removido da lista dos visitados: ", bDelete.uuid);
                this.state.beaconsToDelete.splice(bDelete_index, 1);
                this.state.visitedBeacons.splice(vB_index, 1);
                this.setState({
                  beaconsToDelete: this.state.beaconsToDelete,
                  visitedBeacons: this.state.visitedBeacons
                })
                // Vai para a função que vai enviar um post a indicar que o utilizador saiu da zona do beacon 'X'
                this.postExitFromBeacon(bDelete.uuid);
              }
            })
          }

        }
      })

      // Se algum beacon dos que está a ser detectado no momento estiver na lista dos beacons para apagar então
      // remove esse beacon da lista
      this.state.beaconsToDelete.map((bDelete, bDelete_index) => {
        if (this.state.detectedBeacons.some(beacon => beacon.uuid === bDelete.uuid ) === true) {
          console.log("Vai ser removido da lista temporária: ", bDelete.uuid);
          this.state.beaconsToDelete.splice(bDelete_index, 1);
          this.setState({
            beaconsToDelete: this.state.beaconsToDelete
          })
        }
      })
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

  async isBluetoothOn(){
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

  async saveUserProfile(value){
    try {
      await AsyncStorage.setItem('@Profile', JSON.stringify(value));
      console.log("@Profile salvo");
    } catch (error) {
      console.log("Error saving user profile -> " + error);
    }
  }

  async saveLanguage(value){
    I18n.locale = value;
    this.setState({})
    try {
      await AsyncStorage.setItem('@Language', JSON.stringify(value));
      console.log("@Language saved");
    } catch (error) {
      console.log("Error saving language -> " + error);
    }
  }

  showButtons(){
    if (this.state.showProgressBar == false && this.state.showSpinner == false) {
      return true
    } else {
      return false
    }
  }

  descriptionTypes_languages(dscp){
    switch(I18n.locale){
			case 'pt-PT':
				return dscp.name_pt
			case 'en-GB':
				return dscp.name_en
			case 'fr-FR':
				return dscp.name_fr
			case 'de-DE':
				return dscp.name_de
		}
  }

  render(){
    console.log("DADOS: ", this.state.data);
    const { navigate } = this.props.navigation;
    const window = Dimensions.get('window');
    // const { locale } = this.props.store;
    // console.log('Images Downloaded: ', this.state.imagesDownloaded);
    // console.log('Total of Images: ', this.state.totalOfImages);

    return (
      <ImageBackground source={require('../config/pictures/tomar_centro.jpg')} style={styles.container}>

        <ActionButton
          buttonColor="rgba(0,0,0,0.1)"
          bgColor="rgba(0,0,0,0.5)"
          offsetY={10}
          offsetX={10}
          verticalOrientation="down"
          useNativeFeedback={false}
          style={{zIndex: 999}}
          renderIcon={() => <Icon type="ionicon" color="white" size={36} name="md-settings" style={styles.actionButtonIcon} />}
        >
          {this.state.data.categories == undefined ? console.log('') : this.state.data.categories.map(dscp => (
            <ActionButton.Item
              key={dscp.id}
              buttonColor='rgb(7, 94, 84)'
              title={this.descriptionTypes_languages(dscp)}
              useNativeFeedback={false}
              onPress={() => this.saveUserProfile(dscp.position)}
            >
              <Icon type="font-awesome" color="white" name="user" style={styles.actionButtonIcon} />
            </ActionButton.Item>
          ))}
        </ActionButton>

        <ActionButton
          buttonColor="rgba(0,0,0,0.1)"
          bgColor="rgba(0,0,0,0.5)"
          offsetY={10}
          offsetX={80}
          verticalOrientation="down"
          style={{zIndex: 999}}
          useNativeFeedback={false}
          renderIcon={() => <Icon type="feather" color="white" size={36} name="flag" style={styles.actionButtonIcon} />}
        >
          <ActionButton.Item
            key={'pt'}
            buttonColor='transparent'
            title={'PT'}
            useNativeFeedback={false}
            onPress={() => this.saveLanguage('pt-PT')}
          >
            <Flag code="PT" style={styles.flag} />
          </ActionButton.Item>

          <ActionButton.Item
            key={'en'}
            buttonColor='transparent'
            title={'EN'}
            useNativeFeedback={false}
            onPress={() => this.saveLanguage('en-GB')}
          >
            <Flag code="GB" style={styles.flag} />
          </ActionButton.Item>

          <ActionButton.Item
            key={'fr'}
            buttonColor='transparent'
            title={'FR'}
            useNativeFeedback={false}
            onPress={() => this.saveLanguage('fr-FR')}
          >
            <Flag code="FR" style={styles.flag} />
          </ActionButton.Item>

          <ActionButton.Item
            key={'de'}
            buttonColor='transparent'
            title={'DE'}
            useNativeFeedback={false}
            onPress={() => this.saveLanguage('de-DE')}
          >
            <Flag code="DE" style={styles.flag} />
          </ActionButton.Item>

        </ActionButton>

        <View style={styles.titulo}>
          <Text style={styles.tituloText}><Text style={styles.titutoTextM}>M</Text>ovtour</Text>
        </View>

        <View style={styles.progressBar}>
          <Display enable={this.state.showProgressBar}>
            <Progress.Circle
              progress={Number(this.state.progressBar)}
              color={'white'}
              borderWidth={4}
              borderColor={'white'}
              size={Dimensions.get('window').width/2}
              thickness={8}
              indeterminate={this.state.showSpinner}
              formatText={() => (this.state.progressBar * 100).toFixed(0) + '%'}
              showsText={true}
              textStyle={{color: 'white'}}
            />
          </Display>
        </View>


        <View style={styles.contentContainer}>
          <Display enable={this.showButtons()}>
            <View style={styles.buttonContent}>
              <TouchableHighlight
                onPress={() => navigate('MultiPointMap', {data:this.state.data})}
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
                onPress={() => navigate('Monument', {data:this.state.data})}
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

  progressBar:{
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
