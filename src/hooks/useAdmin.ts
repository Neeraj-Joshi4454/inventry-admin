import { useQuery } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import type {
  AdminReportParams,
  ListAdminDocumentsParams,
  ListAdminInventoryParams,
  ListAdminProductsParams,
} from '@/lib/api/admin';

export function useAdminOverviewQuery() {
  return useQuery({ queryKey: ['admin', 'overview'], queryFn: adminApi.getOverview });
}

export function useTenantStatsQuery(tenantId: string) {
  return useQuery({
    queryKey: ['admin', 'tenant-stats', tenantId],
    queryFn: () => adminApi.getTenantStats(tenantId),
    enabled: !!tenantId,
  });
}

export function useAdminProductsQuery(params: ListAdminProductsParams) {
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => adminApi.listProducts(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminInventoryQuery(params: ListAdminInventoryParams) {
  return useQuery({
    queryKey: ['admin', 'inventory', params],
    queryFn: () => adminApi.listInventory(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminSalesQuery(params: ListAdminDocumentsParams, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'sales', params],
    enabled,
    queryFn: () => adminApi.listSales(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminPurchasesQuery(params: ListAdminDocumentsParams, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'purchases', params],
    enabled,
    queryFn: () => adminApi.listPurchases(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminReportQuery(params: AdminReportParams) {
  return useQuery({
    queryKey: ['admin', 'report', params],
    queryFn: () => adminApi.getReport(params),
    placeholderData: (previousData) => previousData,
  });
}
