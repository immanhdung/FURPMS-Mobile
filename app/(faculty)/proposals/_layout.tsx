import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

export default function ProposalsLayout() {
  const { t } = useTranslation('faculty');
  const { colors } = useTheme();

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
      <Stack.Screen name="[id]" options={{ title: t('proposalsLayout.detailsTitle') }} />
      <Stack.Screen name="create" options={{ title: t('proposalsLayout.newProposalTitle') }} />
    </Stack>
  );
}
