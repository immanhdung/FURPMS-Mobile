import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function MeetingsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background.card },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Meeting Details' }} />
    </Stack>
  );
}
