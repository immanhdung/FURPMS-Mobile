import { View, Text, Image, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';
import { useTheme } from '@/hooks/useTheme';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'expo-router';

export function LoginScreen() {
  const { t } = useTranslation('auth');
  const { isDark, colors } = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isAvailable, isEnabled, isAuthenticating, capabilities, authenticate } = useBiometricAuth();

  const showBiometric = isAvailable && isEnabled;

  async function handleBiometricLogin() {
    const result = await authenticate('Sign in to FURPMS');
    if (result.success && isAuthenticated) {
      // Auth store already holds a valid session token — biometric just unlocked it.
      // Navigation is handled by AuthProvider's role-based redirect.
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-0">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <View className="flex-1 px-6 justify-center gap-8">
        {/* Brand header */}
        <View className="items-center gap-4">
          <Image
            source={require('../../../../assets/logo.png')}
            style={{ width: 96, height: 118 }}
            resizeMode="contain"
          />
          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans text-center leading-5">
            {t('brandTagline')}
          </Text>
        </View>

        {/* Login card */}
        <View className="bg-neutral-50 dark:bg-dark-50 rounded-2xl p-6 gap-5 border border-neutral-100 dark:border-dark-200">
          <View className="gap-0.5">
            <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-semibold">
              {t('signInTitle')}
            </Text>
            <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
              {t('signInSubtitle')}
            </Text>
          </View>

          <LoginForm />
        </View>

        {/* Biometric login — only shown when available and enabled by user */}
        {showBiometric && (
          <View className="items-center gap-3">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-neutral-200 dark:bg-dark-200" />
              <Text className="text-neutral-400 dark:text-dark-400 text-xs font-sans">{t('or')}</Text>
              <View className="flex-1 h-px bg-neutral-200 dark:bg-dark-200" />
            </View>

            <TouchableOpacity
              onPress={handleBiometricLogin}
              disabled={isAuthenticating}
              activeOpacity={0.7}
              className="items-center gap-2"
            >
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: isDark ? '#1c1c1e' : '#f3f0ff', borderWidth: 1, borderColor: isDark ? '#2a2a2a' : '#ddd6fe' }}
              >
                {isAuthenticating ? (
                  <ActivityIndicator size="small" color={colors.accent.primary} />
                ) : (
                  <Ionicons
                    name={capabilities?.primaryType === 'face' ? 'scan-outline' : 'finger-print-outline'}
                    size={28}
                    color={colors.accent.primary}
                  />
                )}
              </View>
              <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
                {isAuthenticating
                  ? t('authenticating')
                  : capabilities?.primaryType === 'face'
                  ? t('signInWithFaceId')
                  : t('signInWithTouchId')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <Text className="text-neutral-400 dark:text-dark-400 text-xs text-center font-sans">
          {t('footer')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
