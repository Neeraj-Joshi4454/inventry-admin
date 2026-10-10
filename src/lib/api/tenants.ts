import { apiClient } from './client';
import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type { AccountStatus } from '@/types/auth';
import type {
  CreateTenantPayload,
  CreateTenantResult,
  Tenant,
  UpdateTenantPayload,
} from '@/types/tenant';

export interface ListTenantsParams {
  page?: number;
  limit?: number;
  status?: AccountStatus;
  search?: string;
  sortBy?: 'businessName' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export async function listTenants(params: ListTenantsParams = {}): Promise<ApiPaginated<Tenant>> {
  const res = await apiClient.get<ApiPaginated<Tenant>>('/tenants', { params });
  return res.data;
}

/**
 * Reads the backend-computed pagination total for a given status — a
 * server-side count, not a frontend aggregation, so this still honors
 * "don't calculate dashboard stats on the frontend" while the Reports
 * module (which would otherwise host a dedicated stats endpoint) isn't
 * built yet.
 */
export async function getTenantsCountByStatus(status: AccountStatus): Promise<number> {
  const res = await apiClient.get<ApiPaginated<Tenant>>('/tenants', {
    params: { page: 1, limit: 1, status },
  });
  return res.data.meta.total;
}

export async function getTenantsTotalCount(): Promise<number> {
  const res = await apiClient.get<ApiPaginated<Tenant>>('/tenants', {
    params: { page: 1, limit: 1 },
  });
  return res.data.meta.total;
}

export async function createTenantWithOwner(
  payload: CreateTenantPayload
): Promise<CreateTenantResult> {
  const res = await apiClient.post<ApiSuccess<CreateTenantResult>>('/tenants', payload);
  return res.data.data;
}

/**
 * No GET /tenants/:id endpoint exists on the backend yet (only list +
 * status update) — fetched by paging through the list and matching the id
 * client-side. Fine for an admin tool at this scale; revisit if a
 * dedicated endpoint is ever added.
 */
export async function getTenantById(id: string): Promise<Tenant> {
  const res = await apiClient.get<ApiPaginated<Tenant>>('/tenants', {
    params: { page: 1, limit: 100 },
  });
  const found = res.data.data.find((t) => t._id === id);
  if (!found) throw new Error('Business not found');
  return found;
}

export async function updateTenantStatus(id: string, status: AccountStatus): Promise<Tenant> {
  const res = await apiClient.patch<ApiSuccess<Tenant>>(`/tenants/${id}/status`, { status });
  return res.data.data;
}

export async function updateTenant(id: string, payload: UpdateTenantPayload): Promise<Tenant> {
  const res = await apiClient.patch<ApiSuccess<Tenant>>(`/tenants/${id}`, payload);
  return res.data.data;
}
