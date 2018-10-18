import I18n from 'i18n-js';
import DeviceInfo from 'react-native-device-info';


if (DeviceInfo.getDeviceLocale() == "pt-PT" || DeviceInfo.getDeviceLocale() == "en-GB" || DeviceInfo.getDeviceLocale() == "fr-FR" || DeviceInfo.getDeviceLocale() == "de-DE") {
  I18n.defaultLocale = DeviceInfo.getDeviceLocale();
} else {
  I18n.defaultLocale = "en-GB";
}

I18n.fallbacks = true;

I18n.translations = {
  pt: {
    map: 'Mapa',
    monuments: 'Monumentos',
    convent: "Convento",
    museum: "Museus",
    church: "Igrejas",
    other: "Outros Locais",
    pt: 'Português',
    gb: 'Inglês',
    fr: 'Francês',
    de: 'Alemão'
  },
  en: {
    map: 'Map',
    monuments: 'Monuments',
    convent: "Convent",
    museum: "Museum",
    church: "Church",
    other: "Other Places",
    pt: 'Portuguese',
    gb: 'English',
    fr: 'French',
    de: 'German'
  },
  fr: {
    map: 'Carte',
    monuments: 'Monuments',
    convent: "Couvent",
    museum: "Musée",
    church: "Église",
    other: "D'autres lieux",
    pt: 'Portugais',
    gb: 'Anglais',
    fr: 'Français',
    de: 'Allemand'
  },
  de: {
    map: 'Karte',
    monuments: 'Monumente',
    convent: "Kloster",
    museum: "Museum",
    church: "Kirche",
    other: "Andere Orte",
    pt: 'Portugiesisch',
    gb: 'Englisch',
    fr: 'Französisch',
    de: 'Deutsche'
  }
};

export default I18n;
