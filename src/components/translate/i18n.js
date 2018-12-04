import{ AsyncStorage } from 'react-native';
import I18n from 'i18n-js';
import DeviceInfo from 'react-native-device-info';


AsyncStorage.getItem('@Language', (err, value) => {
  if (err) {
    console.log("Error getting Language: ", err);
  } else if (!value) {
    if (DeviceInfo.getDeviceLocale() == "pt-PT" || DeviceInfo.getDeviceLocale() == "en-GB" || DeviceInfo.getDeviceLocale() == "fr-FR" || DeviceInfo.getDeviceLocale() == "de-DE") {
      I18n.locale = DeviceInfo.getDeviceLocale();
    } else {
      I18n.locale = "en-GB";
    }
  } else {
    I18n.locale = (JSON.parse(value));
  }
});


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
    de: 'Alemão',
    language: 'Língua',
    contentType: 'Tipo de conteúdo',
    aboutUs:'Sobre nós',
    aboutUsText1:'Sistema desenvolvido no âmbito do Projeto "MovTour - Turismo e Cultura com e para a Sociedade".',
    aboutUsText2:'Desenvolvido em parceria entre o Instituto Politécnico de Tomar, o Instituito Politécnico de Santarém e o Centro de Estudos Sociais da Universidade de Coimbra e cofinanciado pelo Programa Operacional Competitividade e Internacionalização, Portugal 2020 e União Europeia através do Fundo Europeu de Desenvolvimento Regional.',
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
    de: 'German',
    language: 'Language',
    contentType: 'Content Type',
    aboutUs:'About us',
    aboutUsText1:'System developed under the project "MovTour - Tourism and Culture and for Society".',
    aboutUsText2:'Developed in partnership between the Polytechnic Institute of Tomar, the Polytechnic Institute of Santarém and the Center for Social Studies of the University of Coimbra and co-financed by the Operational Program for Competitiveness and Internationalization, Portugal 2020 and the European Union through the European Regional Development Fund.'
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
    de: 'Allemand',
    language: 'Langue',
    contentType: 'Type de contenu',
    aboutUs:'À propos de nous',
    aboutUsText1:'Système développé dans le cadre du projet "MovTour - Tourisme et Culture et pour la société".',
    aboutUsText2:'Développé en partenariat entre l’Institut polytechnique de Tomar, l’Institut polytechnique de Santarém et le Centre d’études sociales de l’Université de Coimbra et cofinancé par le Programme opérationnel pour la compétitivité et l’internationalisation, Portugal 2020 et l’Union européenne, par le biais du Fonds européen de développement régional.',
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
    de: 'Deutsche',
    language: 'Sprache',
    contentType: 'Inhaltstyp',
    aboutUs:'Über uns',
    aboutUsText1:'System entwickelt unter dem Projekt "MovTour - Tourismus und Kultur und für die Gesellschaft".',
    aboutUsText2:'Entwickelt in Partnerschaft zwischen dem Polytechnischen Institut von Tomar, dem Polytechnischen Institut von Santarém und dem Zentrum für Sozialstudien der Universität Coimbra und mitfinanziert vom Operationellen Programm für Wettbewerbsfähigkeit und Internationalisierung, Portugal 2020 und der Europäischen Union über den Europäischen Fonds für regionale Entwicklung.',
  }
};

export default I18n;
