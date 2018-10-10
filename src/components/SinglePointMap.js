import React, {Component} from 'react';
import {
  StyleSheet,         // CSS-like styles
  Text,               // Renders text
  TouchableOpacity,   // Pressable container
  View                // Container component
} from 'react-native';

import MapView from 'react-native-maps';
import Callout from '../config/Callout';


export default class Mapa extends Component {

  static navigationOptions = ({ navigation }) => {
    const { monumento } = navigation.state.params;

    return {
      title: monumento.name
    }
	}

	render(){

		const { monumento }  = this.props.navigation.state.params;

		return (
			<View style={styles.container}>

				<MapView
					style={styles.map}
					initialRegion={{
						latitude: 39.604419,
					    longitude: -8.411803,
					    latitudeDelta: 0.0122,
					    longitudeDelta: 0.0221,
					}}
				>

					<MapView.Marker
						coordinate={{
							latitude: monumento.latitude,
	            longitude: monumento.longitude,
						}}
						//calloutOffset={{x:-8, y:28}}
						pinColor='#009688'
						key={this.props.monumento}
					/>

				</MapView>
			</View>
		);

	}
}

const styles = StyleSheet.create({
	container:{
		flex: 1,
	},

	map:{
		...StyleSheet.absoluteFillObject,
	},
})
