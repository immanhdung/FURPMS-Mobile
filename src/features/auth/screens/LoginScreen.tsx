import {
  View,
  Text,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useTheme } from '@/hooks/useTheme';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'expo-router';

const HERO_HEIGHT = 300;

export function LoginScreen() {
  const { t } = useTranslation('auth');
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 bg-white dark:bg-dark-0">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero */}
        <ImageBackground
          source={require('../../../../public/loginbg.jpeg')}
          resizeMode="cover"
          style={{
            height: HERO_HEIGHT + insets.top,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={['rgba(30,20,70,0.4)', 'rgba(40,20,90,0.55)', 'rgba(18,10,48,0.92)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View
            style={{
              flex: 1,
              paddingTop: insets.top + 18,
              paddingHorizontal: 24,
              paddingBottom: 44,
              justifyContent: 'space-between',
            }}
          >
            <Image
              source={require('../../../../public/logofpt.png')}
              style={{ width: 128, height: 49 }}
              resizeMode="contain"
            />
            <Text className="text-white text-2xl font-bold leading-8">{t('brandTagline')}</Text>
          </View>
        </ImageBackground>

        {/* Floating brand badge */}
        <View style={{ alignItems: 'center', marginTop: -54 }}>
          <GlassSurface
            intensity={60}
            rounded={24}
            className="py-3.5 px-[18px]"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <Image
              source={require('../../../../assets/logo.png')}
              style={{ width: 60, height: 74 }}
              resizeMode="contain"
            />
          </GlassSurface>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-5 gap-6">
          {/* Login card */}
          <GlassSurface
            intensity={55}
            rounded={24}
            className="p-6 gap-5"
            style={{
              shadowColor: '#000',
              shadowOpacity: isDark ? 0 : 0.06,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: isDark ? 0 : 2,
            }}
          >
            <View className="items-center gap-1">
              <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold tracking-tight">
                {t('signInTitle')}
              </Text>
              <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
                {t('signInSubtitle')}
              </Text>
            </View>

            <LoginForm />
          </GlassSurface>

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
                  style={{ backgroundColor: isDark ? '#1c1c1e' : '#eaf0fd', borderWidth: 1, borderColor: isDark ? '#2a2a2a' : '#c7d7fa' }}
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
      </ScrollView>
    </View>
  );
}
