import React from 'react';
import { View, Image, Text } from 'react-native';
import {
  createSwitchNavigator,
  createStackNavigator,
  createDrawerNavigator,
  createAppContainer
} from 'react-navigation';

import { PRIMARY_COLOR } from './styles/common';
import Splashpage from './Splashpage';
import Homepage from './Homepage';
import MonumentDetails from './MonumentDetails';
import DrawerMenu from './DrawerMenu';
import SinglePointMap from './SinglePointMap';
import MultiPointMap from './MultiPointMap';
import AboutUs from './AboutUs';
// import Tabs from './Tabs';
import store from './MovtourStore';

import { Icon } from 'react-native-elements';
import { BluetoothStatus } from 'react-native-bluetooth-status';

const Splash = createStackNavigator({
  Splashpage: {
    screen: Splashpage,
    navigationOptions: {
      header: null,
    }
  }
})

const Stack = createStackNavigator({
  Homepage: Homepage,
  MonumentDetails: MonumentDetails,
  MultiPointMap: MultiPointMap,
  SinglePointMap: SinglePointMap,
  AboutUs: AboutUs,
}, {
  initialRouteName: 'Homepage',
  headerLayoutPreset: 'center',
  defaultNavigationOptions: ({ navigation }) => ({
    headerTitle:(
        <Image style={{ width: 50, height: 50 }} source={require('../config/pictures/movtour_logo.png')}/>
    ),
    headerBackTitle: null,
    headerStyle:{
      height:70,
      backgroundColor:'white',
      shadowOpacity: 0,
      shadowOffset: {height:0, width:0},
      shadowRadius: 0,
      borderBottomWidth: 0,
      elevation: 0,
    },
    headerTitleStyle:{
      fontSize: 14,
      fontWeight: 'normal',
      color:'white',
      alignSelf: 'center',
      textAlign: 'center'
    },
    headerRight: (
      <View style={{flexDirection:'row'}}>
        <Icon
          name='menu'
          type='MaterialIcons'
          color={PRIMARY_COLOR}
          size={30}
          underlayColor='transparent'
          containerStyle={{paddingRight: 10}}
          onPress={() => navigation.toggleDrawer()}
        />
      </View>
    ),
    headerTintColor:PRIMARY_COLOR,
  }),
});

const Switcher = createSwitchNavigator({
  Stack: Stack,
  Splash: Splash
},{
  initialRouteName: 'Splash',
})

const Drawer = createDrawerNavigator({
  Switcher: Switcher
}, {
  contentComponent: DrawerMenu,
  drawerPosition: 'right'
})



export default createAppContainer(Drawer);
