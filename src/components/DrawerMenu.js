import React, { Component } from 'react';
import {
  StyleSheet, View, Text, ScrollView, AsyncStorage, Image
} from 'react-native';

import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import I18n from './translate/i18n';
import { ListItem } from 'react-native-elements';
import Flag from 'react-native-round-flags';
import { NavigationEvents } from 'react-navigation';
import { SafeAreaView } from 'react-navigation';
import Collapsible from 'react-native-collapsible';

@inject('store')
@observer
export default class DrawerMenu extends React.Component {

  @observable collapseLanguage = true;
  @observable collapseText = true;

  @action setCollapseLanguage(){
    this.collapseLanguage = !this.collapseLanguage;
  }

  @action setCollapseText(){
    this.collapseText = !this.collapseText;
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
          {/* Componente que contém a distribuição dos POIs pelo mapa */}
          <ListItem
            title={I18n.t('map')}
            leftIcon={{name: 'google-maps', color: 'white', type: 'material-community'}}
            hideChevron={true}
            containerStyle={{backgroundColor: '#E5530F', alignItems:'center', justifyContent: 'center'}}
            titleStyle={{color: 'white'}}
            bottomDivider={true}
            onPress={() => navigate('MultiPointMap')}
          />
          {/* Definir a língua da aplicação */}
          <ListItem
            title={I18n.t('language')}
            leftIcon={{name: 'language', color: 'white', type: 'font-awesome'}}
            rightIcon={{name: this.collapseLanguage ? 'chevron-small-down' : 'chevron-small-up', color: 'white', type: 'entypo'}}
            hideChevron={true}
            containerStyle={{backgroundColor: '#E5530F', alignItems:'center', justifyContent: 'center'}}
            titleStyle={{color: 'white'}}
            bottomDivider={true}
            onPress={() => this.setCollapseLanguage()}
          />
          <Collapsible collapsed={this.collapseLanguage}>
            <ListItem
              title={I18n.t('pt')}
              rightIcon={ <Flag code="PT" style={styles.flag} />}
              onPress={() => this.saveLanguage('pt-PT')}
              containerStyle={[I18n.locale == 'pt-PT' ? styles.listItemBG : '']}
              bottomDivider={true}
            />
            <ListItem
              title={I18n.t('gb')}
              rightIcon={ <Flag code="GB" style={styles.flag} />}
              onPress={() => this.saveLanguage('en-GB')}
              containerStyle={[I18n.locale == 'en-GB' ? styles.listItemBG : '']}
              bottomDivider={true}
            />
            <ListItem
              title={I18n.t('fr')}
              rightIcon={ <Flag code="FR" style={styles.flag} />}
              onPress={() => this.saveLanguage('fr-FR')}
              containerStyle={[I18n.locale == 'fr-FR' ? styles.listItemBG : '']}
              bottomDivider={true}
            />
            <ListItem
              title={I18n.t('de')}
              rightIcon={ <Flag code="DE" style={styles.flag} />}
              onPress={() => this.saveLanguage('de-DE')}
              containerStyle={[I18n.locale == 'de-DE' ? styles.listItemBG : '']}
              bottomDivider={true}
            />
          </Collapsible>

          {/* Definir o nível do contéudo do texto */}
          <ListItem
            title={I18n.t('contentType')}
            leftIcon={{name: 'description', color: 'white'}}
            rightIcon={{name: this.collapseText ? 'chevron-small-down' : 'chevron-small-up', color: 'white', type: 'entypo'}}
            hideChevron={true}
            containerStyle={{backgroundColor: '#E5530F', alignItems:'center', justifyContent: 'center'}}
            titleStyle={{color: 'white'}}
            bottomDivider={true}
            onPress={() => this.setCollapseText()}
          />

          <Collapsible collapsed={this.collapseText}>
            {data.categories == undefined ? console.log('') : data.categories.map(dscp => (
              <ListItem
                key={dscp.id}
                title={this.descriptionTypes_languages(dscp)}
                hideChevron={true}
                onPress={() => this.saveUserProfile(dscp.position)}
                containerStyle={[description_type_position == dscp.position ? styles.listItemBG : '']}
                bottomDivider={true}
              />
            ))}
          </Collapsible>


          {/* Projecto financiado pelo programa Movtour...etc...etc..  */}
          {/* Parcerias */}
          <ListItem
            title={I18n.t('aboutUs')}
            leftIcon={{name: 'info', color: 'white', type: 'entypo'}}
            hideChevron={true}
            containerStyle={{backgroundColor: '#E5530F', alignItems:'center', justifyContent: 'center'}}
            titleStyle={{color: 'white'}}
            bottomDivider={true}
            onPress={() => navigate('AboutUs')}
          />
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
    marginBottom: 20,
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
})
