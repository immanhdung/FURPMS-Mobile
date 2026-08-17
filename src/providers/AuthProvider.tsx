import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { onUnauthorized } from '@/services/http.client';
import { ROLES } from '@/constants/roles';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isInitializing, isAuthenticated, user, initialize, clearAuth, activeRole } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const queryClient = useQueryClient();

  useEffect(() => {
    initialize();
  }, []);

  // Registered once: on any 401, drop the session and wipe cached data (including the MMKV-
  // persisted query cache) so a second user on the same device never sees a flash of stale data.
  useEffect(() => {
    onUnauthorized(() => {
      clearAuth();
      queryClient.clear();
    });
  }, [clearAuth, queryClient]);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inFacultyGroup = segments[0] === '(faculty)';
    const inReviewGroup = segments[0] === '(review)';

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    const roles = user?.roles ?? [];
    const hasFaculty = roles.includes(ROLES.FACULTY);
    const hasReviewer = roles.includes(ROLES.REVIEW_COMMITTEE);

    if (!hasFaculty && !hasReviewer) {
      router.replace('/(auth)/unsupported-role');
      return;
    }

    const currentRole = activeRole ?? (hasFaculty ? ROLES.FACULTY : ROLES.REVIEW_COMMITTEE);
    const isFaculty = currentRole === ROLES.FACULTY;
    const isReviewer = currentRole === ROLES.REVIEW_COMMITTEE;
    const homeRoute = isFaculty ? '/(faculty)' : isReviewer ? '/(review)' : '/(auth)/unsupported-role';

    if (inAuthGroup) {
      router.replace(homeRoute as never);
      return;
    }

    if (isFaculty && inReviewGroup) {
      router.replace('/(faculty)');
    }
    if (isReviewer && inFacultyGroup) {
      router.replace('/(review)');
    }
  }, [isInitializing, isAuthenticated, user, segments, activeRole]);

  return <>{children}</>;
}
