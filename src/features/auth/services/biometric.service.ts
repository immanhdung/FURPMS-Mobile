import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricType = 'face' | 'fingerprint' | 'iris' | 'none';

export interface BiometricCapabilities {
  isAvailable: boolean;
  isPlatformEnrolled: boolean;
  supportedTypes: BiometricType[];
  primaryType: BiometricType;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

function mapAuthType(type: LocalAuthentication.AuthenticationType): BiometricType {
  switch (type) {
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return 'face';
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return 'fingerprint';
    case LocalAuthentication.AuthenticationType.IRIS:
      return 'iris';
    default:
      return 'none';
  }
}

export const biometricService = {
  async getCapabilities(): Promise<BiometricCapabilities> {
    const [hasHardware, isEnrolled, supportedRaw] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);

    const supportedTypes = supportedRaw.map(mapAuthType).filter((t) => t !== 'none');
    const primaryType: BiometricType =
      supportedTypes.includes('face')
        ? 'face'
        : supportedTypes.includes('fingerprint')
        ? 'fingerprint'
        : 'none';

    return {
      isAvailable: hasHardware && isEnrolled,
      isPlatformEnrolled: isEnrolled,
      supportedTypes,
      primaryType,
    };
  },

  async authenticate(reason?: string): Promise<BiometricAuthResult> {
    const { isAvailable } = await this.getCapabilities();

    if (!isAvailable) {
      return { success: false, error: 'Biometric authentication not available' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason ?? 'Authenticate to access FURPMS',
      cancelLabel: 'Use Password',
      disableDeviceFallback: false,
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      return { success: true };
    }

    const errorMap: Partial<Record<string, string>> = {
      user_cancel: 'Authentication was cancelled',
      user_fallback: 'User chose to use password instead',
      system_cancel: 'Authentication was cancelled by the system',
      passcode_not_set: 'No passcode is set on this device',
      not_available: 'Biometric authentication is not available',
      not_enrolled: 'No biometric credentials are enrolled',
      lockout: 'Biometric authentication is temporarily locked',
      lockout_permanent: 'Biometric authentication is permanently locked',
    };

    const errorCode = (result as { error?: string }).error ?? 'unknown';
    return {
      success: false,
      error: errorMap[errorCode] ?? `Authentication failed: ${errorCode}`,
    };
  },

  getBiometricLabel(type: BiometricType): string {
    const labels: Record<BiometricType, string> = {
      face: 'Face ID',
      fingerprint: 'Fingerprint',
      iris: 'Iris Scan',
      none: 'Biometric',
    };
    return labels[type];
  },

  getBiometricIcon(type: BiometricType): string {
    const icons: Record<BiometricType, string> = {
      face: 'scan',
      fingerprint: 'finger-print',
      iris: 'eye',
      none: 'lock-closed',
    };
    return icons[type];
  },
};
