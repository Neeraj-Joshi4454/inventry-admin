'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Truck } from 'lucide-react';
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
import {
  BusinessFilter,
  DateRangeFilter,
  FilterBar,
  SearchFilter,
  SelectFilter,
} from '@/components/admin/Filters';
import { PaymentStatusBadge } from '@/components/admin/StatusBadges';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAdminPurchasesQuery, useAdminSalesQuery } from '@/hooks/useAdmin';
import { dayEndIso, dayStartIso, formatCurrency, formatDate } from '@/lib/utils/format';
import type { ListAdminDocumentsParams } from '@/lib/api/admin';
import type { PaymentStatus } from '@/types/admin';

/** One row, whichever kind of document it came from. */
interface Row {
  _id: string;
  number: string;
  subNumber?: string;
  date: string;
  tenantId: string;
  businessName?: string;
  partyName?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
}

const KIND = {
  sale: {
    icon: ShoppingCart,
    searchPlaceholder: 'Search by sale number...',
    numberLabel: 'Sale No.',
    partyLabel: 'Customer',
    empty: 'No sales found',
    // Sales use CREDIT for "nothing paid yet"; purchases use UNPAID.
    statuses: ['PAID', 'PARTIAL', 'CREDIT'] as PaymentStatus[],
  },
  purchase: {
    icon: Truck,
    searchPlaceholder: 'Search purchase or invoice no...',
    numberLabel: 'Purchase No.',
    partyLabel: 'Supplier',
    empty: 'No purchases found',
    statuses: ['PAID', 'PARTIAL', 'UNPAID'] as PaymentStatus[],
  },
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PAID: 'Paid',
  PARTIAL: 'Partial',
  UNPAID: 'Unpaid',
  CREDIT: 'Credit',
};

function useRows(kind: 'sale' | 'purchase', params: ListAdminDocumentsParams) {
  // Both hooks are always called (rules of hooks); only the matching one fetches.
  const sales = useAdminSalesQuery(params, kind === 'sale');
  const purchases = useAdminPurchasesQuery(params, kind === 'purchase');

  if (kind === 'sale') {
    return {
      ...sales,
      rows: sales.data?.data.map(
        (s): Row => ({
          _id: s._id,
          number: s.saleNumber,
          date: s.saleDate,
          tenantId: s.tenantId,
          businessName: s.businessName,
          partyName: s.customerName,
          totalAmount: s.totalAmount,
          paidAmount: s.paidAmount,
          dueAmount: s.dueAmount,
          paymentStatus: s.paymentStatus,
        })
      ),
    };
  }
  return {
    ...purchases,
    rows: purchases.data?.data.map(
      (p): Row => ({
        _id: p._id,
        number: p.purchaseNumber,
        subNumber: p.invoiceNumber,
        date: p.purchaseDate,
        tenantId: p.tenantId,
        businessName: p.businessName,
        partyName: p.supplierName,
        totalAmount: p.totalAmount,
        paidAmount: p.paidAmount,
        dueAmount: p.dueAmount,
        paymentStatus: p.paymentStatus,
      })
    ),
  };
}

export function DocumentList({ kind }: { kind: 'sale' | 'purchase' }) {
  const config = KIND[kind];
  const [search, setSearch] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const params: ListAdminDocumentsParams = {
    page,
    limit: 20,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(tenantId ? { tenantId } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(range.from ? { fromDate: dayStartIso(range.from) } : {}),
    ...(range.to ? { toDate: dayEndIso(range.to) } : {}),
  };

  const { data, rows, isLoading, isFetching } = useRows(kind, params);
  const filtered = !!(debouncedSearch || tenantId || paymentStatus || range.from || range.to);

  function resetPage<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <Card className="mt-6">
      <FilterBar>
        <SearchFilter
          value={search}
          onChange={resetPage(setSearch)}
          placeholder={config.searchPlaceholder}
        />
        <BusinessFilter value={tenantId} onChange={resetPage(setTenantId)} />
        <SelectFilter
          label="All payments"
          value={paymentStatus}
          onChange={resetPage((v: string) => setPaymentStatus(v as PaymentStatus | ''))}
          options={config.statuses.map((value) => ({ value, label: STATUS_LABEL[value] }))}
        />
        <DateRangeFilter from={range.from} to={range.to} onChange={resetPage(setRange)} />
      </FilterBar>

      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : !data || !rows || rows.length === 0 ? (
        <EmptyState
          icon={config.icon}
          title={config.empty}
          description={filtered ? 'Try adjusting your search or filters.' : undefined}
        />
      ) : (
        <>
          <Table className={isFetching ? 'opacity-60 transition-opacity' : ''}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{config.numberLabel}</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Business</TableHeaderCell>
                <TableHeaderCell>{config.partyLabel}</TableHeaderCell>
                <TableHeaderCell className="text-right">Total</TableHeaderCell>
                <TableHeaderCell className="text-right">Paid</TableHeaderCell>
                <TableHeaderCell className="text-right">Due</TableHeaderCell>
                <TableHeaderCell>Payment</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{row.number}</p>
                    {row.subNumber && (
                      <p className="text-xs text-slate-400">Invoice {row.subNumber}</p>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell>
                    <Link href={`/businesses/${row.tenantId}`} className="hover:underline">
                      {row.businessName ?? '—'}
                    </Link>
                  </TableCell>
                  <TableCell>{row.partyName ?? '—'}</TableCell>
                  <TableCell className="text-right font-medium text-slate-900">
                    {formatCurrency(row.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(row.paidAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.dueAmount)}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={row.paymentStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </Card>
  );
}
