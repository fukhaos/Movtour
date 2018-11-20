import React, { Component } from 'react';
import{
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableHighlight,
	TouchableOpacity,
	StatusBar,
	AsyncStorage
} from 'react-native';

import { observer, inject } from 'mobx-react';
import {Tile, List, ListItem, Icon, Button} from 'react-native-elements';
// import Swiper from 'react-native-swiper';
import RNFS from 'react-native-fs';
import HTMLView from 'react-native-htmlview';
// import Modal from 'react-native-modalbox';
import ActionButton from 'react-native-action-button';
import I18n from './translate/i18n';

@inject('store')
@observer
export default class MonumentDetails extends Component{

	state = {
		description_type_position: 1
	}

	static navigationOptions = ({ navigation }) => {
    const { monumento } = navigation.state.params;

    return {
      title: monumento.name
    }
	}

	async saveUserProfile(value){
    try {
      await AsyncStorage.setItem('@Profile', JSON.stringify(value));
			this.setState({description_type_position: value});
    } catch (error) {
      console.log("Error saving user profile -> " + error);
    }
  }

	descriptionByLocale(poi){
		const {description_type_position} = this.props.store;
		switch(I18n.locale){
			case 'pt-PT':
				return(
					<HTMLView
						value={poi.poi_descriptions[description_type_position-1] == undefined ? 'Sem informação.' : poi.poi_descriptions[description_type_position-1].description_pt}
						stylesheet={styles}
					/>
				);
			case 'en-GB':
				return(
					<HTMLView
						value={poi.poi_descriptions[description_type_position-1] == undefined ? 'Sem informação.' : poi.poi_descriptions[description_type_position-1].description_en}
						stylesheet={styles}
					/>
				);
			case 'fr-FR':
				return(
					<HTMLView
						value={poi.poi_descriptions[description_type_position-1] == undefined ? 'Sem informação.' : poi.poi_descriptions[description_type_position-1].description_fr}
						stylesheet={styles}
					/>
				);
			case 'de-DE':
				return(
					<HTMLView
						value={poi.poi_descriptions[description_type_position-1] == undefined ? 'Sem informação.' : poi.poi_descriptions[description_type_position-1].description_de}
						stylesheet={styles}
					/>
				);
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
		const {navigate} = this.props.navigation;
		const {monumento, poi, swiperIndex, description_types}  = this.props.navigation.state.params;
		return (
			<View style={styles.container}>
				<ScrollView>
					{poi.cover_image_md5 != undefined ?
						<Tile	imageSrc = {{uri:`file://${RNFS.DocumentDirectoryPath}/images/`+ poi.cover_image_md5 + `.jpg`}} />
						:
						<Tile imageSrc = {require('../config/pictures/missing.jpg')} />
					}
					<View style={styles.map}>
						<Icon
						  raised
						  reverse
						  name='location-on'
							containerStyle={{margin:0, marginRight: 15}}
						  color='#075e54'
						  onPress={() => navigate('SinglePointMap', {monumento: monumento})}
						/>
					</View>
					<View style={styles.titleContainer}>
						<Text style={styles.titleText}>{poi.name}</Text>
					</View>
					<View style={styles.bodyContent}>
						{this.descriptionByLocale(poi)}
					</View>
				</ScrollView>
				<ActionButton
					buttonColor="rgba(0,0,0,0.5)"
					size={52}
					offsetX={15}
					offsetY={15}
					bgColor="rgba(0,0,0,0.5)"
					spacing={19}
					verticalOrientation="up"
					style={{position:'absolute', zIndex: 999}}
					renderIcon={() => <Icon type="ionicon" color="white" size={36} name="md-settings" style={styles.actionButtonIcon} />}
				>
					{description_types.map(dscp => (
						<ActionButton.Item
							key={dscp.id}
							buttonColor='rgb(7, 94, 84)'
							title={this.descriptionTypes_languages(dscp)}
							onPress={() => this.saveUserProfile(dscp.position)}
						>
							<Icon type="entypo" color="white" name="text-document" style={styles.actionButtonIcon} />
						</ActionButton.Item>
					))}
				</ActionButton>
			</View>
		);
	}
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white'
	},

	actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white'
  },

	buttonContainer: {
		flex:1,
    flexDirection:'row',
    justifyContent:'center',
		flexWrap:'wrap',
		margin: 3
	},

	button: {
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
    fontFamily: 'sans-serif-light',
    color: 'white'
	},

	paginationStyle:{
		alignItems: 'flex-start',
		justifyContent: 'center',
		top: 10,
		height:50,
	},

	buttonWrapperStyle:{
		alignItems: 'flex-start',
		paddingVertical: 0,
	},

	buttonText:{
		fontSize:50,
		color:'#075e54',
	},

	activeDot:{
		backgroundColor: '#075e54',
		width: 10,
		height: 10,
		borderRadius: 5,
		marginLeft: 3,
		marginRight: 3,
		marginTop: 3,
		marginBottom: 3,
	},

	dot:{
		// backgroundColor:'rgba(0,0,0,.2)',
		width: 10,
		height: 10,
		borderRadius: 5,
		borderWidth: 1,
		borderColor:'#075e54',
		marginLeft: 3,
		marginRight: 3,
		marginTop: 3,
		marginBottom: 3,
	},

	map:{
		flexDirection: 'row',
		alignItems:'flex-end',
		justifyContent:'flex-end',
		marginTop:-60,
		padding: 0,
	},

	titleContainer:{
		margin:10,
		marginRight:60,
		marginBottom:0,
		marginTop:-10
	},

	title:{
		flex:6,
		justifyContent:'center',
	},

	titleText: {
		color: '#075e54',
		fontSize: 20,
		textAlign: 'left',
	},

	bodyContent:{
		borderTopWidth:0.25,
		borderTopColor:'grey',
		margin:10,
		paddingTop:10,
	},

	bodyText:{
		fontFamily: 'normal',
		fontSize: 16,
		color: 'black'
	}
})
