import { createContext, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';
import { lightColors, darkColors, type ThemeColors } from '@/constants/colors';
import { useThemeStore, type ThemePreference } from '@/stores/theme.store';

interface ThemeContextValue {
  colorScheme: 'light' | 'dark';
  colors: ThemeColors;
  isDark: boolean;
  theme: ThemePreference;
  toggleTheme: () => void;
  setTheme: (scheme: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore();
  const { setColorScheme } = useColorScheme();
  const deviceScheme = useDeviceColorScheme();

  useEffect(() => {
    if (theme === 'system') {
      setColorScheme('system');
    } else {
      setColorScheme(theme);
    }
  }, [theme, setColorScheme]);

  const resolved: 'light' | 'dark' =
    theme === 'system' ? (deviceScheme ?? 'light') : theme;

  const colors = (resolved === 'dark' ? darkColors : lightColors) as ThemeColors;

  function toggleTheme() {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: resolved,
        colors,
        isDark: resolved === 'dark',
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
