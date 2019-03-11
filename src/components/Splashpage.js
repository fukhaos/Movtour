import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  AsyncStorage,
  Alert,
  Image,
} from 'react-native';

import { PRIMARY_COLOR } from './styles/common';

import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { Icon } from 'react-native-elements';
import moment from 'moment';
import fetch from 'react-native-fetch-polyfill';
import RNFS from 'react-native-fs';
import * as Progress from 'react-native-progress';
import RNExitApp from 'react-native-exit-app';
import Display from 'react-native-display';


@inject('store')
@observer
export default class Homepage extends Component {
  // VARIABLES
  @observable showProgressCircle= true;
  @observable progressCircle= 0;
  @observable showSpinner = true;
  @observable willDownload = false;
  @observable totalImages = 0;
  @observable imagesDownloaded = 0;

  // ACTIONS
  @action.bound incrementTotalImages(){
    this.totalImages++;
  }

  @action.bound incrementImagesDownloaded(){
    this.imagesDownloaded++;
  }



  componentWillMount() {
    RNFS.mkdir(RNFS.DocumentDirectoryPath+ '/images/');
    // Para limpar os dados guardados no AsyncStorage, descomentar a próxima linha.
    // AsyncStorage.clear();
  }

  componentDidMount(){
    // -- FETCHING DATA ---------------------------------------------- FETCHING DATA --
    fetch('http://movtour.ipt.pt/monuments.json', {timeout: 10 * 1000})
    // fetch('http://192.168.161.14:3000/monuments.json', {timeout: 10 * 1000})
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
  } //Fim do componentDidMount

  deleteImages(){
    const { data } = this.props.store;
    return (
      RNFS.readDir(`${RNFS.DocumentDirectoryPath}/images/`)
      .then( result => {
        // console.log('RNFS dir:', result);
        if (result.length){
          result.map((r, index) => {
            // console.log(r.name);
            // RNFS.hash(r.path, 'md5').then(result => console.log(`${r.name}:${result}`));

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
          this.props.navigation.navigate('Stack');
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
                  this.willDownload = false;
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
                  this.willDownload = false;
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
            // this.getMovtourBeacons();
            this.props.navigation.navigate('Stack');
          }
        }
      })
    )
  }

  render(){
    const window = Dimensions.get('window');
    return (
      <View style={styles.container}>
        <Image
          source={require('../config/pictures/movtour_logo.png')}
          style={styles.logo}
        />
        <View style={styles.titulo}>
          <Text style={styles.tituloText}>Movtour</Text>
        </View>



        <View style={styles.progressCircle}>
          <Display enable={this.showProgressCircle}>
          {/* <Display enable={false}> */}
            {/* <Progress.Circle
              progress={Number(this.progressCircle)}
              color={'white'}
              borderWidth={4}
              borderColor={PRIMARY_COLOR}
              size={Dimensions.get('window').width/2}
              thickness={8}
              indeterminate={this.showSpinner}
              formatText={() => (this.progressCircle * 100).toFixed(0) + '%'}
              showsText={true}
              textStyle={{color: PRIMARY_COLOR}}
            /> */}

            <Progress.Bar
              progress={Number(this.progressCircle)}
              color={PRIMARY_COLOR}
              unfilledColor={'white'}
              borderWidth={1}
              borderColor={PRIMARY_COLOR}
              width={Dimensions.get('window').width/2}
              height={6}
              indeterminate={this.showSpinner}
            />
          </Display>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  titulo:{
    // flex:2,
    // marginTop:30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor: 'pink',
  },

  tituloText:{
    fontSize: 50,
    fontWeight: '100',
    // fontFamily: 'sans-serif-light',
    color: PRIMARY_COLOR,
    // textShadowColor:'#252525',
    // textShadowOffset:{width:2, height:2},
    // textShadowRadius: 15,
  },

  logo:{
    width:200,
    height:200,
    // backgroundColor: 'blue',
  },

  progressCircle:{
    // flex:1,
    justifyContent: 'center',
    alignItems:'flex-end',
    backgroundColor: 'pink',
    // alignSelf:'center',
  },
});
