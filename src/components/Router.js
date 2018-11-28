import React from 'react';
import {
  createSwitchNavigator,
  createStackNavigator,
  createDrawerNavigator,
  createAppContainer
} from 'react-navigation';

import { Icon } from 'react-native-elements';

import Homepage from './Homepage';
import Monument from './Monument';
import MonumentDetails from './MonumentDetails';
import DrawerMenu from './DrawerMenu';
// import SinglePointMap from './SinglePointMap';
import MultiPointMap from './MultiPointMap';
// import Tabs from './Tabs';
// import Teste from './Teste';
import store from './MovtourStore';

const Stack = createStackNavigator({
  Homepage: {
    screen: Homepage,
    navigationOptions: {
      header: null,
    }
  },
  Monument: Monument,
  MonumentDetails: MonumentDetails,
  MultiPointMap: MultiPointMap,
  // SinglePointMap: SinglePointMap,
  // Tabs: Tabs,
}, {
  initialRouteName: 'Homepage',
  defaultNavigationOptions: ({ navigation }) => ({
    headerBackTitle: null,
    headerStyle:{
      height:40,
      backgroundColor:'#075e54',
    },
    headerTitleStyle:{
      fontSize: 14,
      fontWeight: 'normal',
      color:'white',
      // alignSelf: 'center'
    },
    headerRight: (
      <Icon
        name='menu'
        type='MaterialIcons'
        color='white'
        underlayColor='transparent'
        containerStyle={{paddingRight: 10}}
        onPress={() => navigation.toggleDrawer()}
      />
    ),
    headerTintColor:'#fff',
  }),
});

const Drawer = createDrawerNavigator({
  Stack: { screen: Stack }
}, {
  contentComponent: DrawerMenu
})

export default createAppContainer(Drawer);
