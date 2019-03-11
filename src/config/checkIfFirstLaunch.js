import { AsyncStorage } from 'react-native';

const HAS_LAUNCHED = 'hasLaunched';

// Verifica se é a primeira vez que a app é iniciada ou não
export default async function checkIfFirstLaunch() {
  try {
    const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED);
    if (hasLaunched === null) {
      setAppLaunched();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Define como SIM se a app ja tiver sido lançada
function setAppLaunched() {
  AsyncStorage.setItem(HAS_LAUNCHED, 'true');
}
