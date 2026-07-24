import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { LocaleProvider } from './LocaleProvider';
import { NotificationProvider } from './NotificationProvider';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

// Provider order matters:
// QueryProvider       — outermost, no dependencies
// ThemeProvider       — syncs MMKV store → NativeWind colorScheme
// LocaleProvider      — syncs MMKV store → i18next active language
// NotificationProvider — registers push permissions
// AuthProvider        — reads SecureStore, drives role-based routing
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <LocaleProvider>
          <NotificationProvider>
            <AuthProvider>{children}</AuthProvider>
          </NotificationProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
