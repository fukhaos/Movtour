import React, {Component} from 'react';
import {Platform} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Teste from './src/components/Teste';
// import Homepage from './src/components/Homepage';
// import Tabs from './src/components/Tabs';
// import Monument from './src/components/Monument';
// import MonumentDetails from './src/components/MonumentDetails';
// import SinglePointMap from './src/components/SinglePointMap';
// import MultiPointMap from './src/components/MultiPointMap';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <Stack />
    );
  }
}

const Stack = StackNavigator({
  Teste:{
    screen: Teste,
    navigationOptions: {
      header: null
    },
  },
  // Homepage: {
  //   screen: Homepage,
  //   navigationOptions: {
  //     header: null
  //   },
  // },
  // Monument: {
  //   screen: Monument,
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
  // MonumentDetails:{
  //   screen: MonumentDetails,
  //   navigationOptions:{
  //   // navigationOptions: ({ navigation }) => ({
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
  //       // alignSelf: 'center'
  //     },
  //
  //     headerTintColor:'#fff',
  //   },
  // },
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
