import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isInitializing, isAuthenticated, user, initialize } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inFacultyGroup = segments[0] === '(faculty)';
    const inReviewGroup = segments[0] === '(review)';

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    if (inAuthGroup) {
      router.replace(user?.role === 'FACULTY' ? '/(faculty)' : '/(review)');
      return;
    }

    if (user?.role === 'FACULTY' && inReviewGroup) {
      router.replace('/(faculty)');
    }
    if (user?.role === 'REVIEW_COMMITTEE' && inFacultyGroup) {
      router.replace('/(review)');
    }
  }, [isInitializing, isAuthenticated, user, segments]);

  return <>{children}</>;
}
