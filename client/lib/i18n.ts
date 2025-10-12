import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';
import kn from '../locales/kn.json';
import mr from '../locales/mr.json';
import pa from '../locales/pa.json';
import gu from '../locales/gu.json';
import or from '../locales/or.json';
import bn from '../locales/bn.json';
import ml from '../locales/ml.json';
import ta from '../locales/ta.json';
import ur from '../locales/ur.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  kn: { translation: kn },
  mr: { translation: mr },
  pa: { translation: pa },
  gu: { translation: gu },
  or: { translation: or },
  bn: { translation: bn },
  ml: { translation: ml },
  ta: { translation: ta },
  ur: { translation: ur },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: localStorage.getItem('selectedLanguage') || 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];
