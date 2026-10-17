'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, UserPlus, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import { FieldLabel } from '@/components/ui/Input';
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
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/admin/PageHeader';
import {
  useApproveRegistrationMutation,
  useRegistrationsQuery,
  useRejectRegistrationMutation,
} from '@/hooks/useRegistrations';
import { getApiErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/format';
import type { RegistrationRequest, RegistrationStatus } from '@/types/registration';

const TABS: { value: RegistrationStatus | ''; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: '', label: 'All' },
];

const STATUS_BADGE: Record<RegistrationStatus, { label: string; tone: 'amber' | 'green' | 'red' }> = {
  PENDING: { label: 'Pending', tone: 'amber' },
  APPROVED: { label: 'Approved', tone: 'green' },
  REJECTED: { label: 'Rejected', tone: 'red' },
};

export default function RegistrationsPage() {
  const toast = useToast();
  const [status, setStatus] = useState<RegistrationStatus | ''>('PENDING');
  const [page, setPage] = useState(1);
  const [approving, setApproving] = useState<RegistrationRequest | null>(null);
  const [rejecting, setRejecting] = useState<RegistrationRequest | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading, isFetching } = useRegistrationsQuery({
    page,
    limit: 20,
    ...(status ? { status } : {}),
  });
  const approve = useApproveRegistrationMutation();
  const reject = useRejectRegistrationMutation();

  async function handleApprove() {
    if (!approving) return;
    try {
      await approve.mutateAsync(approving._id);
      toast.success(`${approving.businessName} approved — the owner can now sign in`);
      setApproving(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to approve registration'));
    }
  }

  async function handleReject() {
    if (!rejecting) return;
    try {
      await reject.mutateAsync({ id: rejecting._id, reason: reason.trim() || undefined });
      toast.success(`${rejecting.businessName} rejected`);
      setRejecting(null);
      setReason('');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reject registration'));
    }
  }

  return (
    <div>
      <PageHeader
        title="Registrations"
        description="Businesses that signed up from the app and are waiting for review."
      />

      <Card className="mt-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium',
                status === tab.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title={status === 'PENDING' ? 'No requests waiting for review' : 'No registration requests'}
            description={
              status === 'PENDING'
                ? 'New sign-ups from the app’s Register screen will appear here.'
                : undefined
            }
          />
        ) : (
          <>
            <Table className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Business</TableHeaderCell>
                  <TableHeaderCell>Owner</TableHeaderCell>
                  <TableHeaderCell>Mobile</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Submitted</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium text-slate-900">
                      {r.tenantId ? (
                        <Link href={`/businesses/${r.tenantId}`} className="hover:underline">
                          {r.businessName}
                        </Link>
                      ) : (
                        r.businessName
                      )}
                    </TableCell>
                    <TableCell>{r.ownerName}</TableCell>
                    <TableCell>{r.mobileNumber}</TableCell>
                    <TableCell>{r.email || '—'}</TableCell>
                    <TableCell>{formatDateTime(r.createdAt)}</TableCell>
                    <TableCell>
                      <Badge tone={STATUS_BADGE[r.status].tone}>{STATUS_BADGE[r.status].label}</Badge>
                      {r.status !== 'PENDING' && r.reviewedAt && (
                        <p className="mt-1 text-xs text-slate-400">
                          {r.reviewedBy?.name ? `${r.reviewedBy.name} · ` : ''}
                          {formatDateTime(r.reviewedAt)}
                        </p>
                      )}
                      {r.rejectionReason && (
                        <p className="mt-0.5 max-w-xs text-xs text-slate-500">{r.rejectionReason}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setRejecting(r)}>
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => setApproving(r)}>
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Reviewed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!approving}
        onClose={() => setApproving(null)}
        onConfirm={handleApprove}
        title={`Approve ${approving?.businessName ?? ''}?`}
        description={`This creates the business with ${approving?.ownerName ?? 'the applicant'} as owner. They can then sign in with ${approving?.mobileNumber ?? 'their mobile number'} and the password they registered with.`}
        confirmLabel="Approve"
        isLoading={approve.isPending}
      />

      <Dialog
        open={!!rejecting}
        onClose={() => {
          setRejecting(null);
          setReason('');
        }}
        title={`Reject ${rejecting?.businessName ?? ''}?`}
        description="No account is created. The applicant sees the reason when they try to sign in, and can register again."
      >
        <FieldLabel htmlFor="rejectReason">Reason (optional)</FieldLabel>
        <textarea
          id="rejectReason"
          rows={3}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Couldn't verify the business details"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setRejecting(null);
              setReason('');
            }}
            disabled={reject.isPending}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} isLoading={reject.isPending}>
            Reject
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
