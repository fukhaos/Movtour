import React, { Component } from 'react';
import{
	StyleSheet,
	Text,
	View,
	ScrollView,
	Image,
  SafeAreaView,
  Dimensions
} from 'react-native';

import { Divider } from 'react-native-elements';

export default class AboutUs extends Component{
  render(){
    return(
      <SafeAreaView>
        <ScrollView>
          <View style={styles.container}>
            <Text style={styles.title}>Sobre nós</Text>
            <View style={styles.aboutUsContainer}>
              <Text style={styles.text}>
                Sistema desenvolvido no âmbito do Projeto "MovTour - Turismo e Cultura com e para a Sociedade".
              </Text>

              <Text style={[styles.text, {marginTop: 10}]}>
                Desenvolvido em parceria entre o Instituto Politécnico de Tomar, o Instituito Politécnico de Santarém e o Centro de Estudos Sociais da Universidade de Coimbra e cofinanciado pelo Programa Operacional Competitividade e Internacionalização, Portugal 2020 e União Europeia através do Fundo Europeu de Desenvolvimento Regional.
              </Text>
          </View>

          <View style={styles.imagesContainer}>
            <View style={styles.imageWrapper}>
              <Image
                resizeMode={'contain'}
                style={styles.images}
                source={require('../config/pictures/movtour.png')}
              />
            </View>

            <View style={styles.imageWrapper}>
              <Image
                resizeMode={'contain'}
                style={styles.images}
                source={require('../config/pictures/ipt.png')}
              />
            </View>

            <View style={styles.imageWrapper}>
              <Image
                resizeMode={'contain'}
                style={styles.images}
                source={require('../config/pictures/ipsantarem.png')}
              />
            </View>

            <View style={styles.imageWrapper}>
              <Image
                resizeMode={'contain'}
                style={styles.images}
                source={require('../config/pictures/Ltour.png')}
              />
            </View>

            <View style={styles.imageWrapper}>
              <Image
                resizeMode={'contain'}
                style={styles.images}
                source={require('../config/pictures/ces.png')}
              />
            </View>

            <View style={styles.imageWrapper}>
              <Image
                resizeMode={'contain'}
                style={styles.images}
                source={require('../config/pictures/portugal2020.png')}
              />
            </View>

            <View style={styles.imageWrapper}>
              <Image
                resizeMode={'contain'}
                style={styles.images}
                source={require('../config/pictures/compete2020.png')}
              />
            </View>

            <View style={styles.imageWrapper}>
              <Image
                resizeMode={'contain'}
                style={styles.images}
                source={require('../config/pictures/fundoEuropeu.png')}
              />
            </View>

          </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea:{
    flex: 1,
  },
  container:{
    flex: 1,
    padding: 30,
  },
  title:{
    fontSize: 24,
    marginBottom:20,
    textAlign: 'center',
    color: 'black'
  },
  aboutUsContainer:{
    padding: 10,
    // backgroundColor:'#eee',
    // borderRadius:5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  text:{
    fontSize: 16,
		color: 'black',
		lineHeight: 25,
  },
  imagesContainer:{
    flex:1,
    marginTop:20,
    paddingVertical:10,
    alignItems:'center',
    backgroundColor:'#eee',
    borderRadius:5,
  },
  imageWrapper:{
    width:'75%',
    height: 100,
    paddingVertical:10,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  images:{
    flex:1,
    width:null,
  }
})
