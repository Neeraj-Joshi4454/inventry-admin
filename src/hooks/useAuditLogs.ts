import { useQuery } from '@tanstack/react-query';
import * as auditLogsApi from '@/lib/api/auditLogs';
import type { ListAuditLogsParams } from '@/lib/api/auditLogs';

export function useAuditLogsQuery(params: ListAuditLogsParams) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogsApi.listAuditLogs(params),
    placeholderData: (previousData) => previousData,
  });
}
