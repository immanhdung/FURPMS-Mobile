import { Platform } from 'react-native';
import * as ExpoSecureStore from 'expo-secure-store';

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return;
  }
  await ExpoSecureStore.setItemAsync(key, value);
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
  return await ExpoSecureStore.getItemAsync(key);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
    return;
  }
  await ExpoSecureStore.deleteItemAsync(key);
}
