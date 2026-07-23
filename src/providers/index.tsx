import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { NotificationProvider } from './NotificationProvider';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

// Provider order matters:
// QueryProvider       — outermost, no dependencies
// ThemeProvider       — syncs MMKV store → NativeWind colorScheme
// NotificationProvider — registers push permissions
// AuthProvider        — reads SecureStore, drives role-based routing
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>{children}</AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
