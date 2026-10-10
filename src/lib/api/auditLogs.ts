import { apiClient } from './client';
import type { ApiPaginated } from '@/types/api';
import type { AuditLog } from '@/types/auditLog';

export interface ListAuditLogsParams {
  page?: number;
  limit?: number;
  tenantId?: string;
}

export async function listAuditLogs(
  params: ListAuditLogsParams = {}
): Promise<ApiPaginated<AuditLog>> {
  const res = await apiClient.get<ApiPaginated<AuditLog>>('/audit-logs', { params });
  return res.data;
}
