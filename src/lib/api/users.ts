import { apiClient } from './client';
import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type { AccountStatus, UserRole } from '@/types/auth';
import type { BusinessUser } from '@/types/user';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  tenantId?: string;
  role?: UserRole;
  status?: AccountStatus;
}

export async function listUsers(params: ListUsersParams = {}): Promise<ApiPaginated<BusinessUser>> {
  const res = await apiClient.get<ApiPaginated<BusinessUser>>('/users', { params });
  return res.data;
}

export async function getUserById(id: string): Promise<BusinessUser> {
  const res = await apiClient.get<ApiSuccess<BusinessUser>>(`/users/${id}`);
  return res.data.data;
}

export async function updateUserStatus(id: string, status: AccountStatus): Promise<BusinessUser> {
  const res = await apiClient.patch<ApiSuccess<BusinessUser>>(`/users/${id}/status`, { status });
  return res.data.data;
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  await apiClient.post(`/users/${id}/reset-password`, { newPassword });
}
