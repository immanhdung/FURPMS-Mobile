import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ReviewMeetingsStackLayout() {
  const { t } = useTranslation('reviewer');
  return (
    <Stack screenOptions={{ headerBackTitle: '', headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: t('meetings.stackTitle') }} />
    </Stack>
  );
}
