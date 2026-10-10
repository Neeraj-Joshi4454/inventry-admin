'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  KeyRound,
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { EditBusinessDialog } from './EditBusinessDialog';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { BusinessStatsGrid } from './BusinessStatsGrid';
import { useTenantQuery, useUpdateTenantStatusMutation } from '@/hooks/useTenants';
import { useUsersQuery } from '@/hooks/useUsers';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import type { AccountStatus } from '@/types/auth';

const STATUS_ACTIONS: { status: AccountStatus; label: string; icon: typeof CheckCircle2 }[] = [
  { status: 'ACTIVE', label: 'Activate', icon: CheckCircle2 },
  { status: 'INACTIVE', label: 'Deactivate', icon: XCircle },
  { status: 'SUSPENDED', label: 'Suspend', icon: Ban },
];

export function BusinessDetailClient({ id }: { id: string }) {
  const toast = useToast();
  const { data: tenant, isLoading, isError } = useTenantQuery(id);
  const { data: owners } = useUsersQuery({ tenantId: id, role: 'OWNER', limit: 1 });
  const updateStatus = useUpdateTenantStatusMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AccountStatus | null>(null);

  const owner = owners?.data[0];
  const pendingAction = STATUS_ACTIONS.find((a) => a.status === pendingStatus);

  async function confirmStatusChange() {
    if (!pendingStatus || !tenant) return;
    try {
      await updateStatus.mutateAsync({ id: tenant._id, status: pendingStatus });
      toast.success(`${tenant.businessName} is now ${pendingStatus.toLowerCase()}`);
      setPendingStatus(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update status'));
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Business not found"
        description="It may have been removed, or the link is incorrect."
        action={
          <Link href="/businesses">
            <Button size="sm" variant="outline">
              Back to Businesses
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link
        href="/businesses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Businesses
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900">{tenant.businessName}</h1>
            <StatusBadge status={tenant.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">Created {formatDate(tenant.createdAt)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          {owner && (
            <Button variant="outline" size="sm" onClick={() => setResetOpen(true)}>
              <KeyRound className="h-4 w-4" />
              Reset Password
            </Button>
          )}
          {STATUS_ACTIONS.filter((a) => a.status !== tenant.status).map((action) => (
            <Button
              key={action.status}
              variant={action.status === 'ACTIVE' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setPendingStatus(action.status)}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Field label="Business Name" value={tenant.businessName} />
              <Field label="Mobile" value={tenant.mobileNumber} />
              <Field label="Email" value={tenant.email || '—'} />
              <Field label="GST Number" value={tenant.gstNumber || '—'} />
              <Field label="Status" value={<StatusBadge status={tenant.status} />} />
              <Field label="Created" value={formatDateTime(tenant.createdAt)} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Field label="Name" value={tenant.ownerName} />
              <Field label="Mobile" value={tenant.mobileNumber} />
              {owner && (
                <>
                  <Field label="Account Status" value={<StatusBadge status={owner.status} />} />
                  <Field
                    label="Last Login"
                    value={owner.lastLoginAt ? formatDateTime(owner.lastLoginAt) : 'Never'}
                  />
                </>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <BusinessStatsGrid />
      </div>

      <EditBusinessDialog open={editOpen} onClose={() => setEditOpen(false)} tenant={tenant} />

      {owner && (
        <ResetPasswordDialog
          open={resetOpen}
          onClose={() => setResetOpen(false)}
          userId={owner._id}
          ownerName={owner.name}
        />
      )}

      <ConfirmDialog
        open={!!pendingStatus}
        onClose={() => setPendingStatus(null)}
        onConfirm={confirmStatusChange}
        title={`${pendingAction?.label} ${tenant.businessName}?`}
        description={`This will change the business status to ${pendingStatus}. The owner and any team members will ${
          pendingStatus === 'ACTIVE' ? 'regain' : 'lose'
        } access immediately.`}
        confirmLabel={pendingAction?.label ?? 'Confirm'}
        isLoading={updateStatus.isPending}
        danger={pendingStatus === 'SUSPENDED' || pendingStatus === 'INACTIVE'}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{value}</dd>
    </div>
  );
}
