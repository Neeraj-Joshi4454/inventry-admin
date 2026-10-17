import { apiClient } from './client';
import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type { RegistrationRequest, RegistrationStatus } from '@/types/registration';

export interface ListRegistrationsParams {
  page?: number;
  limit?: number;
  status?: RegistrationStatus;
}

export async function listRegistrations(
  params: ListRegistrationsParams
): Promise<ApiPaginated<RegistrationRequest>> {
  const res = await apiClient.get<ApiPaginated<RegistrationRequest>>('/registrations', { params });
  return res.data;
}

export async function getPendingRegistrationCount(): Promise<number> {
  const res = await apiClient.get<ApiSuccess<{ count: number }>>('/registrations/pending-count');
  return res.data.data.count;
}

export async function approveRegistration(id: string): Promise<void> {
  await apiClient.post(`/registrations/${id}/approve`);
}

export async function rejectRegistration(id: string, reason?: string): Promise<void> {
  await apiClient.post(`/registrations/${id}/reject`, reason ? { reason } : {});
}
