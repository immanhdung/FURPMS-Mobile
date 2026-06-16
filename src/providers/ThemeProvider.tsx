import { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors, type ThemeColors } from '@/constants/colors';

const THEME_STORAGE_KEY = 'furpms_theme_preference';

interface ThemeContextValue {
  colorScheme: 'light' | 'dark';
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (scheme: 'light' | 'dark') => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  async function loadSavedTheme() {
    try {
      const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        setColorScheme(saved);
      }
    } catch {
      // Fall back to system preference — no action needed
    } finally {
      setIsReady(true);
    }
  }

  function toggleTheme() {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    SecureStore.setItemAsync(THEME_STORAGE_KEY, next).catch(() => null);
  }

  function setTheme(scheme: 'light' | 'dark') {
    setColorScheme(scheme);
    SecureStore.setItemAsync(THEME_STORAGE_KEY, scheme).catch(() => null);
  }

  const resolved = colorScheme ?? 'light';
  const colors = resolved === 'dark' ? darkColors : lightColors;

  // Suppress render until theme preference is loaded to avoid flash
  if (!isReady) return null;

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: resolved,
        colors,
        isDark: resolved === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
