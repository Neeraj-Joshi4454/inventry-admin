import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth/tokenStorage';
import type { ApiSuccess } from '@/types/api';
import type { RefreshResponse } from '@/types/auth';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export const apiClient = axios.create({ baseURL });

// Requests that must never carry a stale Authorization header retry loop —
// login/refresh have their own error handling and must not trigger the
// 401-refresh interceptor below (that would recurse or mask the real error).
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh'];

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config.url?.includes(path));
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Called by AuthProvider once, so the axios layer can trigger a full
 * logout/redirect without importing React state directly (keeps this file
 * framework-agnostic and free of circular imports).
 */
let onAuthFailure: (() => void) | null = null;
export function registerAuthFailureHandler(handler: () => void) {
  onAuthFailure = handler;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Only one refresh call is ever in flight at a time; concurrent 401s queue
// behind it and all retry once it resolves, instead of each firing its own
// competing refresh (which would race the backend's rotation and cause
// every request after the first to lose).
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post<ApiSuccess<RefreshResponse>>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const tokens = response.data.data;
  setTokens(tokens);
  return tokens.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config?.url?.includes(path));

    if (status !== 401 || !config || config._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newAccessToken = await refreshPromise;
      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient.request(config);
    } catch (refreshError) {
      clearTokens();
      onAuthFailure?.();
      return Promise.reject(refreshError);
    }
  }
);

/** Extracts a human-readable message from any error this client can throw. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function getApiFieldErrors(error: unknown): { field?: string; message: string }[] {
  if (axios.isAxiosError(error)) {
    const errors = (error.response?.data as { errors?: { field?: string; message: string }[] } | undefined)
      ?.errors;
    if (Array.isArray(errors)) return errors;
  }
  return [];
}
