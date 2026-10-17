'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaymentStatusBadge, StockStatusBadge } from '@/components/admin/StatusBadges';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils/format';
import type { AdminInventoryItem, PaymentStatus } from '@/types/admin';

export interface ActivityItem {
  id: string;
  number: string;
  businessName?: string;
  date: string;
  amount: number;
  paymentStatus: PaymentStatus;
}

function PanelShell({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Link href={href} className="text-xs font-medium text-slate-500 hover:text-slate-800">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function RecentDocuments({
  title,
  href,
  icon,
  emptyTitle,
  items,
  isLoading,
}: {
  title: string;
  href: string;
  icon: LucideIcon;
  emptyTitle: string;
  items?: ActivityItem[];
  isLoading: boolean;
}) {
  return (
    <PanelShell title={title} href={href}>
      {isLoading ? (
        <LoadingRows />
      ) : !items || items.length === 0 ? (
        <EmptyState icon={icon} title={emptyTitle} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{item.number}</p>
                <p className="truncate text-xs text-slate-500">
                  {item.businessName ?? '—'} · {formatDate(item.date)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-slate-900">{formatCurrency(item.amount)}</p>
                <PaymentStatusBadge status={item.paymentStatus} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}

export function LowStockSummary({
  items,
  isLoading,
  icon,
}: {
  items?: AdminInventoryItem[];
  isLoading: boolean;
  icon: LucideIcon;
}) {
  return (
    <PanelShell title="Low-Stock Summary" href="/inventory">
      {isLoading ? (
        <LoadingRows />
      ) : !items || items.length === 0 ? (
        <EmptyState icon={icon} title="No low-stock products" description="Every product is above its low-stock level." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item._id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {item.businessName ?? '—'} · {item.sku}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm text-slate-700">
                  {formatNumber(item.currentStock)} / {formatNumber(item.lowStockThreshold)}{' '}
                  {item.unitSymbol}
                </span>
                <StockStatusBadge status={item.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}
