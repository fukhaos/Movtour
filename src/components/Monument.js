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
} from 'react-native';

import RNFS from 'react-native-fs';

const Monument = ({ navigation }) => {
  // console.log(navigation);
  const { navigate } = navigation;
  const { data } = navigation.state.params;
  return (
    <View style={styles.container}>
      <ScrollView>
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
                <ImageBackground style={styles.monumentoPic} source={{uri:`file://${RNFS.DocumentDirectoryPath}/images/`+ j.cover_image_md5 + `.jpg`}}>
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
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
	container:{
		flex: 1,
	},
	monumentoContainer:{
		borderBottomWidth: 2,
		borderBottomColor: 'black',
	},
	monumentoPic:{
		justifyContent:'flex-end',
    // height:((Dimensions.get('window').height - StatusBar.currentHeight - 40 - 66)/3),
		height:((Dimensions.get('window').height-106)/3),
		width:Dimensions.get('window').width
	},
	monumentoTitleContainer:{
		backgroundColor:'rgba(7, 94, 84, 0.8)',
		alignSelf:'flex-end',
		height:30,
		alignItems:'center',
		paddingLeft:10,
		paddingRight:5,
		borderTopLeftRadius:20,
		borderBottomLeftRadius:20,
		justifyContent:'center'
	},
	monumentoTitle:{
		color:'white',
	}
})

export default Monument;
