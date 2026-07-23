import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';

// The real backend has no /auth/logout endpoint — logging out is purely client-side (drop the
// token, clear cached data). Kept as a mutation for a consistent loading state in the UI.
export function useLogout() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await clearAuth();
      queryClient.clear();
    },
  });
}
