let mmkvInstance: any;

try {
  // react-native-mmkv uses native JSI/Nitro modules which are unsupported in Expo Go.
  // We use a dynamic require so it doesn't crash at import/load time in Expo Go.
  const { createMMKV } = require('react-native-mmkv');
  mmkvInstance = createMMKV({ id: 'furpms' });
} catch (e) {
  console.warn(
    'react-native-mmkv is not supported in this environment (e.g. Expo Go). Falling back to in-memory mock storage.'
  );
  
  const mockDb = new Map<string, string>();
  mmkvInstance = {
    getString: (key: string) => mockDb.get(key),
    set: (key: string, value: string | number | boolean | Uint8Array) => mockDb.set(key, String(value)),
    delete: (key: string) => mockDb.delete(key),
    clearAll: () => mockDb.clear(),
  };
}

export const mmkv = mmkvInstance;

// Zustand persist-compatible synchronous storage
export const mmkvStorage = {
  getItem: (name: string): string | null => mmkv.getString(name) ?? null,
  setItem: (name: string, value: string): void => mmkv.set(name, value),
  removeItem: (name: string): void => { mmkv.delete(name); },
};
