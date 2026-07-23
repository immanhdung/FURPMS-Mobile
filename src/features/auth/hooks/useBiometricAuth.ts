import { useState, useEffect, useCallback } from 'react';
import { biometricService, type BiometricCapabilities, type BiometricAuthResult } from '../services/biometric.service';
import { useBiometricStore } from '@/stores/biometric.store';

interface UseBiometricAuthReturn {
  capabilities: BiometricCapabilities | null;
  isAvailable: boolean;
  isEnabled: boolean;
  isAuthenticating: boolean;
  enable: () => Promise<boolean>;
  disable: () => void;
  authenticate: (reason?: string) => Promise<BiometricAuthResult>;
}

const DEFAULT_CAPABILITIES: BiometricCapabilities = {
  isAvailable: false,
  isPlatformEnrolled: false,
  supportedTypes: [],
  primaryType: 'none',
};

export function useBiometricAuth(): UseBiometricAuthReturn {
  const { isEnabled, setEnabled, setHasPromptedSetup } = useBiometricStore();
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    biometricService.getCapabilities().then(setCapabilities);
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    const caps = capabilities ?? DEFAULT_CAPABILITIES;
    if (!caps.isAvailable) return false;

    const result = await biometricService.authenticate(
      'Verify your identity to enable biometric login',
    );

    if (result.success) {
      setEnabled(true);
      setHasPromptedSetup(true);
      return true;
    }
    return false;
  }, [capabilities, setEnabled, setHasPromptedSetup]);

  const disable = useCallback(() => {
    setEnabled(false);
  }, [setEnabled]);

  const authenticate = useCallback(
    async (reason?: string): Promise<BiometricAuthResult> => {
      setIsAuthenticating(true);
      try {
        return await biometricService.authenticate(reason);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [],
  );

  return {
    capabilities,
    isAvailable: capabilities?.isAvailable ?? false,
    isEnabled,
    isAuthenticating,
    enable,
    disable,
    authenticate,
  };
}
