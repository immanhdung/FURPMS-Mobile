import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '../services/auth.service';
import type { AuthResponse, LoginCredentials } from '../types/auth.types';
import type { ApiError } from '@/types/common';

export function useLogin() {
  const { setUser } = useAuthStore();

  return useMutation<AuthResponse, ApiError, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (response) => {
      await setUser(response.user, response.accessToken);
    },
  });
}
