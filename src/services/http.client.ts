// __FUTURE__
// This file is intentionally dormant until the backend is ready.
// When activated, swap the mock services for real implementations
// that use this client — no other files should change.

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS } from '@/features/auth/services/auth.service';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
httpClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 and token refresh
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(
          SECURE_KEYS.REFRESH_TOKEN,
        );
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, data.accessToken);
        await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, data.refreshToken);

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return httpClient(original);
      } catch {
        await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
        await SecureStore.deleteItemAsync(SECURE_KEYS.USER);
      }
    }

    return Promise.reject(error);
  },
);
