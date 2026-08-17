import { create } from 'zustand';
import * as SecureStore from '@/utils/secureStore';
import { SECURE_KEYS } from '@/constants/storageKeys';
import { setAuthToken } from '@/services/http.client';
import type { User } from '@/features/auth/types/auth.types';
import { getPrimaryMobileRole, type Role } from '@/constants/roles';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  activeRole: Role | null;
  setUser: (user: User, accessToken: string) => Promise<void>;
  setActiveRole: (role: Role) => Promise<void>;
  clearAuth: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  activeRole: null,

  setUser: async (user, accessToken) => {
    setAuthToken(accessToken);
    const activeRole = getPrimaryMobileRole(user.roles) || null;
    await Promise.all([
      SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(SECURE_KEYS.USER, JSON.stringify(user)),
      activeRole ? SecureStore.setItemAsync(SECURE_KEYS.ACTIVE_ROLE, activeRole) : Promise.resolve(),
    ]);
    set({ user, isAuthenticated: true, activeRole });
  },

  setActiveRole: async (role) => {
    await SecureStore.setItemAsync(SECURE_KEYS.ACTIVE_ROLE, role);
    set({ activeRole: role });
  },

  clearAuth: async () => {
    setAuthToken(null);
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(SECURE_KEYS.USER),
      SecureStore.deleteItemAsync(SECURE_KEYS.ACTIVE_ROLE),
    ]);
    set({ user: null, isAuthenticated: false, activeRole: null });
  },

  initialize: async () => {
    try {
      const [token, raw, storedActiveRole] = await Promise.all([
        SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(SECURE_KEYS.USER),
        SecureStore.getItemAsync(SECURE_KEYS.ACTIVE_ROLE),
      ]);
      if (token && raw) {
        setAuthToken(token);
        const user = JSON.parse(raw) as User;
        const activeRole = (storedActiveRole as Role) || getPrimaryMobileRole(user.roles) || null;
        set({ user, isAuthenticated: true, activeRole });
      }
    } catch {
      // Corrupted storage — start fresh
    } finally {
      set({ isInitializing: false });
    }
  },
}));
