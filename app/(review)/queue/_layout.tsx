import { Stack } from 'expo-router';

export default function QueueStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Review Submission' }} />
    </Stack>
  );
}
