import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Providers } from '@/providers';
import { backgroundSyncService } from '@/services/background-sync.service';
import '../global.css';

SplashScreen.preventAutoHideAsync();

// Register background sync tasks at module level — required by expo-task-manager.
// Tasks are defined inside background-sync.service.ts via TaskManager.defineTask.
backgroundSyncService.register().catch(() => {
  // Non-fatal: background fetch is unavailable in simulators and some environments.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Non-fatal: Ignore splash screen hiding errors.
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }} />
    </Providers>
  );
}
