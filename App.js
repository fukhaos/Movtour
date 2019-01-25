import React, {Component} from 'react';
import { YellowBox } from 'react-native';
import { Provider } from 'mobx-react';

import Drawer from './src/components/Router';
import store from './src/components/MovtourStore';

type Props = {};
export default class App extends Component<Props> {
  render() {
    YellowBox.ignoreWarnings(['Remote debugger', 'Require cycle:', 'Attempted to invoke', 'authorizationStatusDidChange']);
    return (
      <Provider store={store}>
          <Drawer />
      </Provider>
    );
  }
}
