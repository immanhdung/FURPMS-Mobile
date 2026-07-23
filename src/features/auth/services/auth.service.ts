import { httpClient } from '@/services/http.client';
import type {
  LoginCredentials,
  AuthResponse,
  User,
  TokenPair,
} from '../types/auth.types';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getProfile(): Promise<User>;
  refreshToken(token: string): Promise<TokenPair>;
}

const authService: AuthService = {
  async login(credentials) {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async logout() {
    await httpClient.post('/auth/logout');
  },

  async getProfile() {
    const { data } = await httpClient.get<User>('/auth/me');
    return data;
  },

  async refreshToken(token) {
    const { data } = await httpClient.post<TokenPair>('/auth/refresh', {
      refreshToken: token,
    });
    return data;
  },
};

export { authService };
