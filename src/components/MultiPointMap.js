import React, {Component} from 'react';
import {
  StyleSheet,         // CSS-like styles
  Text,               // Renders text
  TouchableOpacity,   // Pressable container
  View,               // Container component
  TouchableHighlight,
} from 'react-native';

import { inject, observer } from 'mobx-react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Callout from '../config/Callout';
import I18n from './translate/i18n';
import { Icon } from 'react-native-elements';


@inject('store')
@observer
export default class Mapa extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: I18n.t('map')
    }
	}

  render(){
    const { navigate } = this.props.navigation;
		const { data }  = this.props.store;

		return (
			<View style={styles.container}>

				<MapView
          provider={PROVIDER_GOOGLE}
					style={styles.map}
					initialRegion={{
						latitude: 39.603678,
				    longitude: -8.419521,
				    latitudeDelta: 0.0052,
				    longitudeDelta: 0.0055,
					}}
				>
          {data.monuments.map(i => i.pois.map((j, index) => {
            // if (i.category === "Castelos"){
              return (
      					<MapView.Marker
      						coordinate={{
      							latitude: j.latitude,
      	            longitude: j.longitude,
      						}}

      						pinColor='#E5530F'
      						key={j.name}
      					>
                  <MapView.Callout tooltip style={styles.callout} onPress={
                    () => navigate({
                            routeName: 'MonumentDetails',
                            params: {monumento:i, poi:j, description_types:data.categories},
                            key:'detail'
                          })
                   }>
                    <View style={styles.calloutContainer}>
                      <View style={[styles.bubble, {backgroundColor:'#E5530F'}]}>
                          <Text style={styles.name}>{j.name}</Text>
                      </View>
                      <View style={[styles.arrow, {borderTopColor:'#E5530F'}]} />
                    </View>
                  </MapView.Callout>
                </MapView.Marker>
              )
            // } else if (i.category === "Museus") {
            //    return (
            //      <MapView.Marker
            //        coordinate={{
            //          latitude: j.latitude,
            //          longitude: j.longitude,
            //        }}
            //        //calloutOffset={{x:-8, y:28}}
            //        pinColor='#f44336'
            //        key={j.name}
            //      >
            //        <MapView.Callout tooltip style={styles.callout} onPress={
            //          () => navigate({
            //                  routeName: 'MonumentDetails',
            //                  params: {monumento:i, poi:j, description_types:data.categories},
            //                  key:'detail'
            //                })
            //         }>
            //
            //          <View style={styles.calloutContainer}>
            //              <View style={[styles.bubble, {backgroundColor:'#f44336'}]}>
            //                  <Text style={styles.name}>{j.name}</Text>
            //              </View>
            //            <View style={[styles.arrow, {borderTopColor:'#f44336'}]} />
            //          </View>
            //        </MapView.Callout>
            //      </MapView.Marker>
            //    )
            //   } else if (i.category === "Igrejas") {
            //    return (
            //      <MapView.Marker
            //        coordinate={{
            //          latitude: j.latitude,
            //          longitude: j.longitude,
            //        }}
            //        //calloutOffset={{x:-8, y:28}}
            //        pinColor='#f39c12'
            //        key={j.name}
            //      >
            //        <MapView.Callout tooltip style={styles.callout} onPress={() => navigate({
            //                routeName: 'MonumentDetails',
            //                params: {monumento:i, poi:j, description_types:data.categories},
            //                key:'detail'
            //              })
            //       }>
            //          <View style={styles.calloutContainer}>
            //            <View style={[styles.bubble, {backgroundColor:'#f39c12'}]}>
            //                <Text style={styles.name}>{j.name}</Text>
            //            </View>
            //            <View style={[styles.arrow, {borderTopColor:'#f39c12'}]} />
            //          </View>
            //        </MapView.Callout>
            //      </MapView.Marker>
            //    )
            //   } else {
            //    return (
            //      <MapView.Marker
            //        coordinate={{
            //          latitude: j.latitude,
            //          longitude: j.longitude,
            //        }}
            //        //calloutOffset={{x:-8, y:28}}
            //        pinColor='#8e44ad'
            //        key={j.name}
            //      >
            //        <MapView.Callout tooltip style={styles.callout} onPress={() => navigate({
            //                routeName: 'MonumentDetails',
            //                params: {monumento:i, poi:j, description_types:data.categories},
            //                key:'detail'
            //              })
            //       }>
            //          <View style={styles.calloutContainer}>
            //            <View style={[styles.bubble, {backgroundColor:'#8e44ad'}]}>
            //                <Text style={styles.name}>{j.name}</Text>
            //            </View>
            //            <View style={[styles.arrow, {borderTopColor:'#8e44ad'}]} />
            //          </View>
            //        </MapView.Callout>
            //      </MapView.Marker>
            //    )
            //   }
          }))}
				</MapView>

        {/* ------------------- Legenda ----------------------*/
        // <View style={styles.buttonContainer}>
  			// 	<View style={[styles.button, {backgroundColor:'#009688'}]}>
  			// 		<Text style={styles.textColor}>{I18n.t('convent')}</Text>
  			// 	</View>
        //
        //   <View style={[styles.button, {backgroundColor:'#f44336'}]}>
  			// 		<Text style={styles.textColor}>{I18n.t('museum')}</Text>
  			// 	</View>
        //
        //   <View style={[styles.button, {backgroundColor:'#f39c12'}]}>
  			// 		<Text style={styles.textColor}>{I18n.t('church')}</Text>
  			// 	</View>
        //
        //   <View style={[styles.button, {backgroundColor:'#8e44ad'}]}>
  			// 		<Text style={styles.textColor}>{I18n.t('other')}</Text>
  			// 	</View>
  			// </View>
        }

			</View>
		);
	}

}

const styles = StyleSheet.create({
	container:{
		flex: 1,
    justifyContent: 'flex-end',
	},

	map:{
		...StyleSheet.absoluteFillObject,
	},

  buttonContainer:{
    flexDirection: 'row',
    justifyContent:'space-around',
		marginVertical: 5,
	},
	button:{
		alignItems: 'center',
		borderRadius: 20,
		padding: 12,
	},
  textColor:{
    color:'white',
  },

  calloutContainer: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },

  //Callout bubble
  bubble:{
    borderRadius: 6,
    padding: 10,
  },

  // Arrow below the bubble
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 16,
    alignSelf: 'center',
  },

  // Character name
  name: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
})
