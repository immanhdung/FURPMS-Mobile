import { Stack } from 'expo-router';
export default function ProjectsLayout() {
  return <Stack screenOptions={{ headerBackTitle: '', headerBackButtonDisplayMode: 'minimal' }}><Stack.Screen name="index" options={{ title: 'Quản lý đề tài' }} /></Stack>;
}
