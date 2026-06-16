import { createContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { authService, SECURE_KEYS } from '@/features/auth/services/auth.service';
import type { User, LoginCredentials } from '@/features/auth/types/auth.types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    redirectByAuthState();
  }, [user, isLoading, segments]);

  async function restoreSession() {
    try {
      const raw = await SecureStore.getItemAsync(SECURE_KEYS.USER);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      // Corrupted storage — start fresh
    } finally {
      setIsLoading(false);
    }
  }

  function redirectByAuthState() {
    const inAuthGroup = segments[0] === '(auth)';
    const inFacultyGroup = segments[0] === '(faculty)';
    const inReviewGroup = segments[0] === '(review)';

    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (inAuthGroup) {
      const target =
        user.role === 'FACULTY' ? '/(faculty)' : '/(review)';
      router.replace(target);
      return;
    }

    // Prevent a Faculty user from being in the review group and vice versa
    if (user.role === 'FACULTY' && inReviewGroup) {
      router.replace('/(faculty)');
    }
    if (user.role === 'REVIEW_COMMITTEE' && inFacultyGroup) {
      router.replace('/(review)');
    }
  }

  async function login(credentials: LoginCredentials) {
    const response = await authService.login(credentials);
    await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, response.accessToken);
    await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, response.refreshToken);
    await SecureStore.setItemAsync(SECURE_KEYS.USER, JSON.stringify(response.user));
    setUser(response.user);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(SECURE_KEYS.USER);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
