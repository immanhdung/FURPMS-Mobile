import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/services/storage.service';
import { MMKV_KEYS } from '@/constants/storageKeys';

interface BiometricState {
  isEnabled: boolean;
  hasPromptedSetup: boolean;
  setEnabled: (enabled: boolean) => void;
  setHasPromptedSetup: (value: boolean) => void;
}

export const useBiometricStore = create<BiometricState>()(
  persist(
    (set) => ({
      isEnabled: false,
      hasPromptedSetup: false,
      setEnabled: (enabled) => set({ isEnabled: enabled }),
      setHasPromptedSetup: (value) => set({ hasPromptedSetup: value }),
    }),
    {
      name: MMKV_KEYS.BIOMETRIC_ENABLED,
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
