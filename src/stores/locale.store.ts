import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getLocales } from 'expo-localization';
import { mmkvStorage } from '@/services/storage.service';

export type Language = 'en' | 'vi';

interface LocaleState {
  language: Language;
  setLanguage: (language: Language) => void;
}

function detectDeviceLanguage(): Language {
  return getLocales()[0]?.languageCode === 'vi' ? 'vi' : 'en';
}

// No stored preference yet (first launch) — fall back to the device's language.
const hasStoredPreference = mmkvStorage.getItem('locale-preference') !== null;

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      language: hasStoredPreference ? 'en' : detectDeviceLanguage(),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'locale-preference',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
