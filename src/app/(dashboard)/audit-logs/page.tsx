'use client';

import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useAuditLogsQuery } from '@/hooks/useAuditLogs';
import { formatDateTime } from '@/lib/utils/format';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogsQuery({ page, limit: 20 });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Audit Logs</h1>
      <p className="mt-1 text-sm text-slate-500">
        Platform-wide record of authentication and business-management actions.
      </p>

      <Card className="mt-6">
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState icon={ScrollText} title="No audit log entries yet" />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Action</TableHeaderCell>
                  <TableHeaderCell>Entity</TableHeaderCell>
                  <TableHeaderCell>Actor Role</TableHeaderCell>
                  <TableHeaderCell>IP Address</TableHeaderCell>
                  <TableHeaderCell>When</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium text-slate-900">{log.action}</TableCell>
                    <TableCell>
                      {log.entityType}
                      <span className="ml-1 text-xs text-slate-400">
                        {log.entityId.slice(-6)}
                      </span>
                    </TableCell>
                    <TableCell>{log.actorRole}</TableCell>
                    <TableCell>{log.ipAddress || '—'}</TableCell>
                    <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
