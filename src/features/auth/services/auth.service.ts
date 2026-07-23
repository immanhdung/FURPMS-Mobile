import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { AuthResponse, ChangePasswordRequest, LoginCredentials, User } from '../types/auth.types';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  getCurrentUser(): Promise<User>;
  changePassword(payload: ChangePasswordRequest): Promise<void>;
}

const authService: AuthService = {
  async login(credentials) {
    const { data } = await httpClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return data.data;
  },

  async getCurrentUser() {
    const { data } = await httpClient.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  async changePassword(payload) {
    await httpClient.post<ApiResponse<null>>('/auth/change-password', payload);
  },
};

export { authService };
