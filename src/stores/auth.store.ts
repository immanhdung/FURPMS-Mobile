import { create } from 'zustand';
import * as SecureStore from '@/utils/secureStore';
import { SECURE_KEYS } from '@/constants/storageKeys';
import type { User } from '@/features/auth/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: (user: User, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  clearAuth: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setUser: async (user, tokens) => {
    await Promise.all([
      SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      SecureStore.setItemAsync(SECURE_KEYS.USER, JSON.stringify(user)),
    ]);
    set({ user, isAuthenticated: true });
  },

  clearAuth: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(SECURE_KEYS.USER),
    ]);
    set({ user: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SECURE_KEYS.USER);
      if (raw) {
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
