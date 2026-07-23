import axios, { type AxiosError } from 'axios';
import type { ApiError } from '@/types/common';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://furpms-be-1.onrender.com/api';

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  // No default Content-Type — axios sets it per-request (JSON for plain objects, the correct
  // multipart boundary for FormData). A fixed "application/json" header breaks file uploads.
});

// In-memory token cache: SecureStore.getItemAsync is an async native-bridge round trip, too slow
// to await on every request. The auth store is the single writer (see stores/auth.store.ts).
let cachedToken: string | null = null;

export function setAuthToken(token: string | null): void {
  cachedToken = token;
}

httpClient.interceptors.request.use((config) => {
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  return config;
});

type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;

/** Registered once by AuthProvider — kept decoupled from the auth store to avoid a circular import. */
export function onUnauthorized(listener: UnauthorizedListener): void {
  unauthorizedListener = listener;
}

function mapStatusToMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The request could not be processed. Please check your input.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 0:
      return 'Unable to reach the server. Please check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | null; errors?: string[] | null }>) => {
    const status = error.response?.status ?? 0;

    const apiError: ApiError = {
      status,
      message: error.response?.data?.message || error.response?.data?.errors?.[0] || mapStatusToMessage(status),
      errors: error.response?.data?.errors ?? undefined,
    };

    if (status === 401) {
      cachedToken = null;
      unauthorizedListener?.();
    }

    return Promise.reject(apiError);
  },
);
