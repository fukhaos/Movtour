import React, { Component } from 'react';
import {
  StyleSheet, View, Text, ScrollView, AsyncStorage, SafeAreaView, Image
} from 'react-native';

import I18n from './translate/i18n';
import { List, ListItem } from 'react-native-elements';
import Flag from 'react-native-round-flags';
import { NavigationEvents } from 'react-navigation';

export default class DrawerMenu extends React.Component {

  state = {
    data: [],
    description_type_position: 1,
  }

  componentDidMount() {
    AsyncStorage.getItem('@Data',(err, dados) => {
      if(err) {
        console.error('Error loading monuments', err)
      } else {
        if(!dados){
          console.log('Os dados estão vazios');
        } else {
          console.log('Vai carregar os dados que estão na memória')
          const monuments = JSON.parse(dados)
          this.setState({
            data: monuments,
          })
        }
      }
    })

    AsyncStorage.getItem('@Profile', (err, value) => {
			if (err) {
				console.log("Error getting Profile: ", err);
			} else if (!value) {
					console.log("Key: @Profile não possui dados");
			} else {
				this.setState({description_type_position: JSON.parse(value)});
			}
		});


    this.props.navigation.addListener(
      'didFocus', payload => {
        console.debug('didFocus', payload);
      }
    );
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

  async saveUserProfile(value){
    this.setState({description_type_position: value})
    try {
      await AsyncStorage.setItem('@Profile', JSON.stringify(value));
      console.log("@Profile salvo");
    } catch (error) {
      console.log("Error saving user profile -> " + error);
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    this.props
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
			        source={require('../config/pictures/movtour_logo.png')}
			        style={styles.logo}
	      		/>
            <Text>Movtour</Text>
          </View>
          <ScrollView>
            <List>
              <ListItem
                title='Língua'
                leftIcon={{name: 'flag', color: 'white', type: 'FontAwesome'}}
                hideChevron={true}
                containerStyle={{backgroundColor: '#E5530F', alignItems:'center', justifyContent: 'center', textAlign: 'center'}}
                titleStyle={{color: 'white'}}
              />
              <ListItem
                title={I18n.t('pt')}
                rightIcon={ <Flag code="PT" style={styles.flag} />}
                onPress={() => this.saveLanguage('pt-PT')}
                containerStyle={[I18n.locale == 'pt-PT' ? styles.listItemBG : '']}
              />
              <ListItem
                title={I18n.t('gb')}
                rightIcon={ <Flag code="GB" style={styles.flag} />}
                onPress={() => this.saveLanguage('en-GB')}
                containerStyle={[I18n.locale == 'en-GB' ? styles.listItemBG : '']}
              />
              <ListItem
                title={I18n.t('fr')}
                rightIcon={ <Flag code="FR" style={styles.flag} />}
                onPress={() => this.saveLanguage('fr-FR')}
                containerStyle={[I18n.locale == 'fr-FR' ? styles.listItemBG : '']}
              />
              <ListItem
                title={I18n.t('de')}
                rightIcon={ <Flag code="DE" style={styles.flag} />}
                onPress={() => this.saveLanguage('de-DE')}
                containerStyle={[I18n.locale == 'de-DE' ? styles.listItemBG : '']}
              />
              <ListItem
                title='Tipo de texto'
                leftIcon={{name: 'description', color: 'white'}}
                hideChevron={true}
                containerStyle={{backgroundColor: '#E5530F', alignItems:'center', justifyContent: 'center', textAlign: 'center'}}
                titleStyle={{color: 'white'}}
              />
            {this.state.data.categories == undefined ? console.log('') : this.state.data.categories.map(dscp => (
              <ListItem
                key={dscp.id}
                title={this.descriptionTypes_languages(dscp)}
                hideChevron={true}
                onPress={() => this.saveUserProfile(dscp.position)}
                containerStyle={[this.state.description_type_position == dscp.position ? styles.listItemBG : '']}
              />
            ))}
          </List>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}


const styles = StyleSheet.create({
  safeArea:{
    flex: 1
  },
  container:{
    flex: 1,
  },
  header:{
    height:100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemBG:{
    backgroundColor: '#DFDFDF'
  },
  logo:{
    width:75,
    height:75,
  },
  flag:{
    width:20,
    height:20,
  },
  label:{

  },
})
