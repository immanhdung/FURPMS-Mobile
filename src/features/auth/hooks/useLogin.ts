import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '../services/auth.service';
import type { LoginCredentials } from '../types/auth.types';

export function useLogin() {
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (response) => {
      await setUser(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    },
  });
}
