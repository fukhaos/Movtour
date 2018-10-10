import React, { Component } from 'react';
import{
	View,
	StyleSheet,
	Text,
	Button,
} from 'react-native';

import { SocialIcon } from 'react-native-elements';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import Flag from 'react-native-round-flags';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import RNExitApp from 'react-native-exit-app';

export default class Teste extends Component{

	state={
		bluetoothState: '',
	}

	componentDidMount() {
    this.checkInitialBluetoothState();
  }

	async checkInitialBluetoothState() {
    const isEnabled = await BluetoothStatus.state();
    this.setState({ bluetoothState: (isEnabled) ? 'On' : 'Off'});
  }

  render (){
			const getOS = DeviceInfo.getSystemName();
      return(
        <View style={styles.container}>
					<Text>Bluetooth: {this.state.bluetoothState}</Text>
					<Text>Date: {moment().format()}</Text>
					<Text>Sistema Operativo: {getOS}</Text>
          <SocialIcon type="facebook"/>
					<Flag code="PT"/>
					<Button
						title="Fechar App"
						onPress={() => RNExitApp.exitApp()}
					/>
        </View>
      )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
