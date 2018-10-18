import React, { Component } from 'react';
import{
	View,
	StyleSheet,
	Text,
	Button,
	PushNotificationIOS
} from 'react-native';

import { SocialIcon } from 'react-native-elements';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import Flag from 'react-native-round-flags';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import RNExitApp from 'react-native-exit-app';
import PushNotification from 'react-native-push-notification';
import Beacons from 'react-native-beacons-manager';
import fetch from 'react-native-fetch-polyfill';
import * as Progress from 'react-native-progress';


export default class Teste extends Component{
	state={
		bluetoothState: '',
		data: '',
	}

	componentDidMount() {
    this.checkInitialBluetoothState();

		PushNotification.configure({
	    // (required) Called when a remote or local notification is opened or received
	    onNotification: function(notification) {
					// required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
	        notification.finish(PushNotificationIOS.FetchResult.NoData);
	    }
		});

		console.log("Entrou no DidMount");
		fetch('http://movtour.ipt.pt/monuments.json', {timeout: 10 * 1000})
			.then(response => response.json())
			.then(response => {
				this.setState({data: response})
				console.log(this.state.data);
			})
		  .catch(error => {
				console.log("Erro no fetch: ", error);
		    // an error when the request fails, such as during a timeout
		  })
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

					<Button
						title="Mandar mensagem"
						onPress={() => PushNotification.localNotification({
							message: "My Notification Message"
						})}
					/>

					<Progress.Circle size={30} indeterminate={true} />
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
