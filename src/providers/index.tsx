import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

// Provider order matters:
// QueryProvider — outermost, no dependencies
// ThemeProvider — reads SecureStore, must be before auth UI renders
// AuthProvider  — reads SecureStore, uses router for redirects
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
