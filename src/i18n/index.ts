import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useLocaleStore } from '@/stores/locale.store';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enProfile from './locales/en/profile.json';
import enFaculty from './locales/en/faculty.json';
import enReviewer from './locales/en/reviewer.json';
import enNotification from './locales/en/notification.json';
import viCommon from './locales/vi/common.json';
import viAuth from './locales/vi/auth.json';
import viProfile from './locales/vi/profile.json';
import viFaculty from './locales/vi/faculty.json';
import viReviewer from './locales/vi/reviewer.json';
import viNotification from './locales/vi/notification.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    profile: enProfile,
    faculty: enFaculty,
    reviewer: enReviewer,
    notification: enNotification,
  },
  vi: {
    common: viCommon,
    auth: viAuth,
    profile: viProfile,
    faculty: viFaculty,
    reviewer: viReviewer,
    notification: viNotification,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: useLocaleStore.getState().language,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'auth', 'profile', 'faculty', 'reviewer', 'notification'],
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

// Keep i18next's active language in sync whenever the persisted preference changes
// (e.g. the language switcher in Profile), including the async rehydration on app start.
useLocaleStore.subscribe((state) => {
  if (i18n.language !== state.language) {
    i18n.changeLanguage(state.language);
  }
});

export default i18n;
