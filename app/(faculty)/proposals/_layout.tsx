import { Stack, useRouter, useNavigationState } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

export default function ProposalsLayout() {
  const { t } = useTranslation('faculty');
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background.card },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitle: '',
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: t('proposalsLayout.detailsTitle'),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(faculty)/proposals');
                }
              }}
              hitSlop={8}
              style={{ marginRight: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="create" options={{ title: t('proposalsLayout.newProposalTitle') }} />
    </Stack>
  );
}
