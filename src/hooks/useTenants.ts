import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tenantsApi from '@/lib/api/tenants';
import type { ListTenantsParams } from '@/lib/api/tenants';
import type { AccountStatus } from '@/types/auth';
import type { CreateTenantPayload, UpdateTenantPayload } from '@/types/tenant';

export const tenantsKeys = {
  all: ['tenants'] as const,
  list: (params: ListTenantsParams) => ['tenants', 'list', params] as const,
  counts: ['tenants', 'counts'] as const,
  detail: (id: string) => ['tenants', 'detail', id] as const,
};

export function useTenantsQuery(params: ListTenantsParams) {
  return useQuery({
    queryKey: tenantsKeys.list(params),
    queryFn: () => tenantsApi.listTenants(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Backend-computed counts (see tenants.ts) — never summed/aggregated client-side. */
export function useTenantCountsQuery() {
  return useQuery({
    queryKey: tenantsKeys.counts,
    queryFn: async () => {
      const [total, active, inactive, suspended] = await Promise.all([
        tenantsApi.getTenantsTotalCount(),
        tenantsApi.getTenantsCountByStatus('ACTIVE'),
        tenantsApi.getTenantsCountByStatus('INACTIVE'),
        tenantsApi.getTenantsCountByStatus('SUSPENDED'),
      ]);
      return { total, active, inactive, suspended };
    },
  });
}

export function useTenantQuery(id: string) {
  return useQuery({
    queryKey: tenantsKeys.detail(id),
    queryFn: () => tenantsApi.getTenantById(id),
    enabled: !!id,
  });
}

export function useCreateTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => tenantsApi.createTenantWithOwner(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.all });
    },
  });
}

export function useUpdateTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTenantPayload }) =>
      tenantsApi.updateTenant(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.all });
    },
  });
}

export function useUpdateTenantStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AccountStatus }) =>
      tenantsApi.updateTenantStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.all });
    },
  });
}
