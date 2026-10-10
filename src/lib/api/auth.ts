import { apiClient } from './client';
import type { ApiSuccess } from '@/types/api';
import type { CurrentUser, LoginResponse } from '@/types/auth';

export async function login(mobileNumber: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiSuccess<LoginResponse>>('/auth/login', {
    mobileNumber,
    password,
  });
  return res.data.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await apiClient.get<ApiSuccess<CurrentUser>>('/auth/me');
  return res.data.data;
}

export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiClient.post('/auth/change-password', { currentPassword, newPassword });
}
