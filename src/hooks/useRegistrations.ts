import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as registrationsApi from '@/lib/api/registrations';
import type { ListRegistrationsParams } from '@/lib/api/registrations';

const registrationsKeys = {
  all: ['registrations'] as const,
  list: (params: ListRegistrationsParams) => ['registrations', 'list', params] as const,
  pendingCount: ['registrations', 'pending-count'] as const,
};

export function useRegistrationsQuery(params: ListRegistrationsParams) {
  return useQuery({
    queryKey: registrationsKeys.list(params),
    queryFn: () => registrationsApi.listRegistrations(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Drives the sidebar badge, so it refreshes on its own every minute. */
export function usePendingRegistrationCountQuery() {
  return useQuery({
    queryKey: registrationsKeys.pendingCount,
    queryFn: registrationsApi.getPendingRegistrationCount,
    refetchInterval: 60_000,
  });
}

export function useApproveRegistrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => registrationsApi.approveRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationsKeys.all });
      // Approval creates a business — every business/platform view changed.
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useRejectRegistrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      registrationsApi.rejectRegistration(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationsKeys.all });
    },
  });
}
