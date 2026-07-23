import { create } from 'zustand';
import * as SecureStore from '@/utils/secureStore';
import { SECURE_KEYS } from '@/constants/storageKeys';
import { setAuthToken } from '@/services/http.client';
import type { User } from '@/features/auth/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: (user: User, accessToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setUser: async (user, accessToken) => {
    setAuthToken(accessToken);
    await Promise.all([
      SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(SECURE_KEYS.USER, JSON.stringify(user)),
    ]);
    set({ user, isAuthenticated: true });
  },

  clearAuth: async () => {
    setAuthToken(null);
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(SECURE_KEYS.USER),
    ]);
    set({ user: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const [token, raw] = await Promise.all([
        SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(SECURE_KEYS.USER),
      ]);
      if (token && raw) {
        setAuthToken(token);
        const user = JSON.parse(raw) as User;
        set({ user, isAuthenticated: true });
      }
    } catch {
      // Corrupted storage — start fresh
    } finally {
      set({ isInitializing: false });
    }
  },
}));
