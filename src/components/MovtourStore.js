import{ AsyncStorage } from 'react-native';
import { action, computed, observable, autorun } from 'mobx';
import I18n from './translate/i18n';

class MovtourStore {
  @observable data = [];
  @observable locale = '';
  @observable description_type_position = 1;

  @action setData(value){
    this.data = value;
    try {
      AsyncStorage.setItem('@Data', JSON.stringify(value));
      console.log("@Data saved");
    } catch (error) {
      console.log("Error saving data -> " + error);
    }
  }

  @action changeLocale(value){
    this.locale = value;
    try {
      AsyncStorage.setItem('@Language', JSON.stringify(value));
      console.log("@Language saved");
    } catch (error) {
      console.log("Error saving language -> " + error);
    }
  }

  @action descriptionType(value){
    this.description_type_position = value;
    try {
      AsyncStorage.setItem('@Profile', JSON.stringify(value));
      console.log("@Profile salvo");
    } catch (error) {
      console.log("Error saving user profile -> " + error);
    }
  }

}

const store = new MovtourStore()
export default store

autorun(() => {
  AsyncStorage.getItem('@Profile', (err, value) => {
    if (err) {
      console.log("Error getting Profile: ", err);
    } else if (!value) {
        console.log("Key: @Profile não possui dados");
    } else {
      store.descriptionType(JSON.parse(value));
    }
  });
})
