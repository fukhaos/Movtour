import React, {Component} from 'react';
import {Platform, YellowBox} from 'react-native';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';


import Homepage from './src/components/Homepage';
import Monument from './src/components/Monument';
import MonumentDetails from './src/components/MonumentDetails';
import DrawerMenu from './src/components/DrawerMenu';
// import SinglePointMap from './src/components/SinglePointMap';
// import MultiPointMap from './src/components/MultiPointMap';
// import Tabs from './src/components/Tabs';
// import Teste from './src/components/Teste';


import { Icon } from 'react-native-elements';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  render() {
    YellowBox.ignoreWarnings(['Remote debugger', 'Require cycle']);
    return (
      <Drawer />
    );
  }
}


const Stack = createStackNavigator({
  Homepage: {
    screen: Homepage,
    navigationOptions: {
      header: null
    },
  },
  Monument: {
    screen: Monument,
    navigationOptions: ({ navigation }) => ({
      // title:'Voltar atrás',

      headerStyle:{
        height:40,
        backgroundColor:'#075e54',
      },

      headerTitleStyle:{
        fontSize: 14,
        fontWeight: 'normal',
        color:'white',
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
  },
  // Tabs: {
  //   screen: Tabs,
  //   navigationOptions:{
  //     // title:'Voltar atrás',
  //
  //     headerStyle:{
  //       height:40,
  //       backgroundColor:'#075e54',
  //     },
  //
  //     headerTitleStyle:{
  //       fontSize: 14,
  //       fontWeight: 'normal',
  //       color:'white',
  //     },
  //
  //     headerTintColor:'#fff',
  //   },
  // },
  MonumentDetails:{
    screen: MonumentDetails,
    // navigationOptions:{
    navigationOptions: ({ navigation }) => ({
      // title:'Voltar atrás',

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
  },
  // SinglePointMap:{
  //   screen: SinglePointMap,
  //   navigationOptions:{
  //
  //     // title:'Voltar atrás',
  //
  //     headerStyle:{
  //       height:40,
  //       backgroundColor:'#075e54',
  //     },
  //
  //     headerTitleStyle:{
  //       fontSize: 14,
  //       fontWeight: 'normal',
  //     },
  //
  //     headerTintColor:'#fff',
  //
  //   },
  // },
  // MultiPointMap:{
  //   screen: MultiPointMap,
  //   // navigationOptions: ({ navigation }) => ({
  //   navigationOptions: {
  //
  //     // title:'Voltar atrás',
  //
  //     headerStyle:{
  //       height:40,
  //       backgroundColor:'#075e54',
  //     },
  //
  //     headerTitleStyle:{
  //       fontSize: 14,
  //       fontWeight: 'normal',
  //     },
  //
  //     headerTintColor:'#fff',
  //
  //     // headerRight:(
  //     //   <Icon
  //     //     name='home'
  //     //     color='white'
  //     //     size={36}
  //     //     onPress={() => navigation.navigate('Homepage')} />
  //     // )
  //
  //   },
  // }
});

const Drawer = createDrawerNavigator({
  Stack: { screen: Stack }
}, {
  contentComponent: DrawerMenu
})
