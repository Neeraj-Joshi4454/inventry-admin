import { apiClient } from './client';
import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type {
  AdminInventoryItem,
  AdminOverview,
  AdminProduct,
  AdminPurchase,
  AdminReport,
  AdminSale,
  PaymentStatus,
  StockStatus,
  TenantStats,
} from '@/types/admin';

interface ListParams {
  page?: number;
  limit?: number;
  tenantId?: string;
  search?: string;
}

export interface ListAdminProductsParams extends ListParams {
  isActive?: 'true' | 'false';
}

export interface ListAdminInventoryParams extends ListParams {
  status?: StockStatus;
}

export interface ListAdminDocumentsParams extends ListParams {
  fromDate?: string;
  toDate?: string;
  paymentStatus?: PaymentStatus;
}

export interface AdminReportParams {
  fromDate?: string;
  toDate?: string;
}

async function list<T>(path: string, params: object): Promise<ApiPaginated<T>> {
  const res = await apiClient.get<ApiPaginated<T>>(`/admin${path}`, { params });
  return res.data;
}

export const listProducts = (params: ListAdminProductsParams) =>
  list<AdminProduct>('/products', params);
export const listInventory = (params: ListAdminInventoryParams) =>
  list<AdminInventoryItem>('/inventory', params);
export const listSales = (params: ListAdminDocumentsParams) => list<AdminSale>('/sales', params);
export const listPurchases = (params: ListAdminDocumentsParams) =>
  list<AdminPurchase>('/purchases', params);

export async function getOverview(): Promise<AdminOverview> {
  const res = await apiClient.get<ApiSuccess<AdminOverview>>('/admin/overview');
  return res.data.data;
}

export async function getTenantStats(tenantId: string): Promise<TenantStats> {
  const res = await apiClient.get<ApiSuccess<TenantStats>>(`/admin/tenants/${tenantId}/stats`);
  return res.data.data;
}

export async function getReport(params: AdminReportParams): Promise<AdminReport> {
  const res = await apiClient.get<ApiSuccess<AdminReport>>('/admin/reports', { params });
  return res.data.data;
}
