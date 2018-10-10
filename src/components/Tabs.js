import React, { Component } from 'react';
import{
	StyleSheet,
	Image
} from 'react-native';

import { TabNavigator } from 'react-navigation';
import Monument from './Monument';
import { Icon } from 'react-native-elements';


export default TabNavigator({
	  Convento: {
	    screen: props => <Monument {...props} category='Castelos' />,
	    navigationOptions: {
			tabBarLabel: 'Convento de Cristo',
			tabBarIcon: ({tintColor}) => (
				<Image
			        source={require('../config/pictures/IconJanela.png')}
			        style={[styles.icon, {tintColor: tintColor}]}
	      		/>
	    	),
	    },
	  },
	  Museus: {
	    screen: props => <Monument {...props} category='Museus' />,
	    navigationOptions: {
	      tabBarLabel: 'Museus',
	      tabBarIcon: ({tintColor}) => (
				<Image
			        source={require('../config/pictures/Museus.png')}
			        style={[styles.icon, {tintColor: tintColor}]}
	      		/>
	    	),
	    },
	  },
	  Igrejas: {
	    screen: props => <Monument {...props} category='Igrejas' />,
	    navigationOptions: {
	      tabBarLabel: 'Igrejas',
	      tabBarIcon: ({tintColor}) => (
				<Image
			        source={require('../config/pictures/Igrejas.png')}
			        style={[styles.icon, {tintColor: tintColor}]}
	      		/>
	    	),
	    },
	  },
	  OutrosLocais: {
	    screen: props => <Monument {...props} category='Locais de Interesse' />,
	    navigationOptions: {
	      tabBarLabel: 'Outros Locais',
	      tabBarIcon: ({tintColor}) => (
				<Image
			        source={require('../config/pictures/mais.png')}
			        style={[styles.icon, {tintColor: tintColor}]}
	      		/>
	    	),
	    },
	  },
	},
	{
		animationEnabled:true,
		tabBarPosition: 'bottom',
		tabBarOptions:{
			indicatorStyle:{
				backgroundColor:'white'
			},
			tabStyle:{
				height:60,

			},
			style:{
				backgroundColor:'#075e54',
			},
			showIcon:true,
			showLabel:false,
			iconStyle:{
				height:40,
				width:40,
			}
		},
	},
);

const styles = StyleSheet.create({
	icon: {
	    width: 46,
	    height: 46,
  	}
})
