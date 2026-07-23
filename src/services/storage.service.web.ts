// Web-compatible fallback for react-native-mmkv
class WebMMKV {
  getString(key: string): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const value = localStorage.getItem(key);
    return value !== null ? value : undefined;
  }

  set(key: string, value: string | number | boolean | Uint8Array): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, String(value));
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}

export const mmkv = new WebMMKV();

// Zustand persist-compatible synchronous storage
export const mmkvStorage = {
  getItem: (name: string): string | null => mmkv.getString(name) ?? null,
  setItem: (name: string, value: string): void => mmkv.set(name, value),
  removeItem: (name: string): void => { mmkv.delete(name); },
};
