import React, { Component } from 'react';
import {
  StyleSheet, View, Text, ScrollView, AsyncStorage, Image
} from 'react-native';

import { inject, observer } from 'mobx-react';
import I18n from './translate/i18n';
import { List, ListItem } from 'react-native-elements';
import Flag from 'react-native-round-flags';
import { NavigationEvents } from 'react-navigation';
import { SafeAreaView } from 'react-navigation';

@inject('store')
@observer
export default class DrawerMenu extends React.Component {

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

  saveLanguage(value){
    this.props.store.changeLocale(value);
    I18n.locale = value;
  }

  saveUserProfile(value){
    this.props.store.descriptionType(value);
  }

  render() {
    const { navigate } = this.props.navigation;
    const { data, description_type_position, locale } = this.props.store;
    return (
      <SafeAreaView style={styles.container}>
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
          {data.categories == undefined ? console.log('') : data.categories.map(dscp => (
            <ListItem
              key={dscp.id}
              title={this.descriptionTypes_languages(dscp)}
              hideChevron={true}
              onPress={() => this.saveUserProfile(dscp.position)}
              containerStyle={[description_type_position == dscp.position ? styles.listItemBG : '']}
            />
          ))}
        </List>
        </ScrollView>
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
