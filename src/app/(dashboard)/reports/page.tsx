'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, HandCoins, ShoppingCart, Truck, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/dashboard/StatCard';
import { PageHeader } from '@/components/admin/PageHeader';
import { DateRangeFilter } from '@/components/admin/Filters';
import { MonthlyTrendChart } from '@/components/admin/MonthlyTrendChart';
import { useAdminReportQuery } from '@/hooks/useAdmin';
import { dayEndIso, dayStartIso, formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { AccountStatus } from '@/types/auth';

function isoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function presetRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const today = isoDate(now);
  switch (preset) {
    case 'this-month':
      return { from: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
    case 'last-6-months':
      return { from: isoDate(new Date(now.getFullYear(), now.getMonth() - 5, 1)), to: today };
    case 'this-year':
      return { from: isoDate(new Date(now.getFullYear(), 0, 1)), to: today };
    default:
      return { from: '', to: '' };
  }
}

const PRESETS = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-6-months', label: 'Last 6 months' },
  { value: 'this-year', label: 'This year' },
  { value: 'all', label: 'All time' },
];

export default function ReportsPage() {
  const [preset, setPreset] = useState('last-6-months');
  const [range, setRange] = useState(() => presetRange('last-6-months'));

  const { data, isLoading, isFetching } = useAdminReportQuery({
    ...(range.from ? { fromDate: dayStartIso(range.from) } : {}),
    ...(range.to ? { toDate: dayEndIso(range.to) } : {}),
  });

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Sales and purchases across the platform for the selected period."
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                setPreset(p.value);
                setRange(presetRange(p.value));
              }}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium',
                preset === p.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <DateRangeFilter
          from={range.from}
          to={range.to}
          onChange={(r) => {
            setPreset('custom');
            setRange(r);
          }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={formatCurrency(data?.totals.sales.amount)}
          hint={data ? `${data.totals.sales.count} sales` : undefined}
          icon={ShoppingCart}
          isLoading={isLoading}
          tone="emerald"
        />
        <StatCard
          label="Total Purchases"
          value={formatCurrency(data?.totals.purchases.amount)}
          hint={data ? `${data.totals.purchases.count} purchases` : undefined}
          icon={Truck}
          isLoading={isLoading}
        />
        <StatCard
          label="Due From Customers"
          value={formatCurrency(data?.totals.sales.due)}
          icon={HandCoins}
          isLoading={isLoading}
          tone="amber"
        />
        <StatCard
          label="Due To Suppliers"
          value={formatCurrency(data?.totals.purchases.due)}
          icon={Wallet}
          isLoading={isLoading}
          tone="red"
        />
      </div>

      <Card className={cn('mt-6', isFetching && 'opacity-60 transition-opacity')}>
        <CardHeader>
          <CardTitle>Monthly Sales vs Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : !data || data.monthly.length === 0 ? (
            <EmptyState icon={BarChart3} title="No sales or purchases in this period" />
          ) : (
            <MonthlyTrendChart data={data.monthly} />
          )}
        </CardContent>
      </Card>

      <Card className={cn('mt-6', isFetching && 'opacity-60 transition-opacity')}>
        <CardHeader>
          <CardTitle>By Business</CardTitle>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : !data || data.businesses.length === 0 ? (
          <EmptyState icon={BarChart3} title="No businesses yet" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Business</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Sales</TableHeaderCell>
                <TableHeaderCell className="text-right">Due From Customers</TableHeaderCell>
                <TableHeaderCell className="text-right">Purchases</TableHeaderCell>
                <TableHeaderCell className="text-right">Due To Suppliers</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.businesses.map((b) => (
                <TableRow key={b.tenantId}>
                  <TableCell className="font-medium text-slate-900">
                    <Link href={`/businesses/${b.tenantId}`} className="hover:underline">
                      {b.businessName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status as AccountStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="font-medium text-slate-900">{formatCurrency(b.sales.amount)}</p>
                    <p className="text-xs text-slate-400">{b.sales.count} sales</p>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(b.sales.due)}</TableCell>
                  <TableCell className="text-right">
                    <p className="font-medium text-slate-900">
                      {formatCurrency(b.purchases.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{b.purchases.count} purchases</p>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(b.purchases.due)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
