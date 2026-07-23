import axios from 'axios';
import * as SecureStore from '@/utils/secureStore';
import { SECURE_KEYS } from '@/constants/storageKeys';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

        await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, data.accessToken);
        await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, data.refreshToken);

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return httpClient(original);
      } catch {
        await Promise.all([
          SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN),
          SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN),
          SecureStore.deleteItemAsync(SECURE_KEYS.USER),
        ]);
      }
    }

    return Promise.reject(error);
  },
);
