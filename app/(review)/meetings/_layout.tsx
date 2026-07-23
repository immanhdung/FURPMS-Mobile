import { Stack } from 'expo-router';

export default function ReviewMeetingsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Meeting Details' }} />
    </Stack>
  );
}
