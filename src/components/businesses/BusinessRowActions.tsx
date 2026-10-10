'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, MoreHorizontal, Pencil, CheckCircle2, XCircle, Ban } from 'lucide-react';
import {
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@/components/ui/DropdownMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EditBusinessDialog } from './EditBusinessDialog';
import { useUpdateTenantStatusMutation } from '@/hooks/useTenants';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/api/client';
import type { AccountStatus } from '@/types/auth';
import type { Tenant } from '@/types/tenant';

const STATUS_ACTIONS: { status: AccountStatus; label: string; icon: typeof CheckCircle2 }[] = [
  { status: 'ACTIVE', label: 'Activate', icon: CheckCircle2 },
  { status: 'INACTIVE', label: 'Deactivate', icon: XCircle },
  { status: 'SUSPENDED', label: 'Suspend', icon: Ban },
];

export function BusinessRowActions({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AccountStatus | null>(null);
  const updateStatus = useUpdateTenantStatusMutation();

  async function confirmStatusChange() {
    if (!pendingStatus) return;
    try {
      await updateStatus.mutateAsync({ id: tenant._id, status: pendingStatus });
      toast.success(`${tenant.businessName} is now ${pendingStatus.toLowerCase()}`);
      setPendingStatus(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update status'));
    }
  }

  const pendingAction = STATUS_ACTIONS.find((a) => a.status === pendingStatus);

  return (
    <>
      <DropdownMenu>
        <DropdownTrigger>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem onSelect={() => router.push(`/businesses/${tenant._id}`)}>
            <Eye className="h-4 w-4" />
            View
          </DropdownItem>
          <DropdownItem onSelect={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownItem>
          {STATUS_ACTIONS.filter((a) => a.status !== tenant.status).map((action) => (
            <DropdownItem key={action.status} onSelect={() => setPendingStatus(action.status)}>
              <action.icon className="h-4 w-4" />
              {action.label}
            </DropdownItem>
          ))}
        </DropdownContent>
      </DropdownMenu>

      <EditBusinessDialog open={editOpen} onClose={() => setEditOpen(false)} tenant={tenant} />

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
    </>
  );
}
