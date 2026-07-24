import '@/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

interface LocaleProviderProps {
  children: React.ReactNode;
}

// i18next is initialized synchronously (module side effect above) with the persisted or
// device-detected language, so there is no loading state / language flash to handle here.
export function LocaleProvider({ children }: LocaleProviderProps) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
