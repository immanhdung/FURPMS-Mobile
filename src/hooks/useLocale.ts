import { useLocaleStore, type Language } from '@/stores/locale.store';

/** Reads/sets the persisted UI language. Use `useTranslation()` from react-i18next to translate strings. */
export function useLocale() {
  const language = useLocaleStore((s) => s.language);
  const setLanguage = useLocaleStore((s) => s.setLanguage);
  return { language, setLanguage };
}

export type { Language };
