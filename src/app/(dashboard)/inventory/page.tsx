'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Boxes, IndianRupee, PackageX } from 'lucide-react';
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
import { StatCard } from '@/components/dashboard/StatCard';
import { PageHeader } from '@/components/admin/PageHeader';
import {
  BusinessFilter,
  FilterBar,
  SearchFilter,
  SelectFilter,
} from '@/components/admin/Filters';
import { STOCK_STATUS_OPTIONS, StockStatusBadge } from '@/components/admin/StatusBadges';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAdminInventoryQuery, useAdminOverviewQuery } from '@/hooks/useAdmin';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import type { StockStatus } from '@/types/admin';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [status, setStatus] = useState<StockStatus | ''>('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data: overview, isLoading: overviewLoading } = useAdminOverviewQuery();
  const { data, isLoading, isFetching } = useAdminInventoryQuery({
    page,
    limit: 20,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(tenantId ? { tenantId } : {}),
    ...(status ? { status } : {}),
  });

  const filtered = !!(debouncedSearch || tenantId || status);

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Stock on hand for every active product, most urgent first."
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Products"
          value={overview?.stock.products}
          icon={Boxes}
          isLoading={overviewLoading}
        />
        <StatCard
          label="Stock Value"
          value={formatCurrency(overview?.stock.stockValue)}
          icon={IndianRupee}
          isLoading={overviewLoading}
          tone="emerald"
        />
        <StatCard
          label="Low Stock"
          value={overview?.stock.lowStock}
          icon={AlertTriangle}
          isLoading={overviewLoading}
          tone="amber"
        />
        <StatCard
          label="Out of Stock"
          value={overview?.stock.outOfStock}
          icon={PackageX}
          isLoading={overviewLoading}
          tone="red"
        />
      </div>

      <Card className="mt-6">
        <FilterBar>
          <SearchFilter
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by product name or SKU..."
          />
          <BusinessFilter
            value={tenantId}
            onChange={(v) => {
              setTenantId(v);
              setPage(1);
            }}
          />
          <SelectFilter
            label="All stock levels"
            value={status}
            onChange={(v) => {
              setStatus(v as StockStatus | '');
              setPage(1);
            }}
            options={STOCK_STATUS_OPTIONS}
          />
        </FilterBar>

        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No stock records found"
            description={filtered ? 'Try adjusting your search or filters.' : undefined}
          />
        ) : (
          <>
            <Table className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Business</TableHeaderCell>
                  <TableHeaderCell className="text-right">Current Stock</TableHeaderCell>
                  <TableHeaderCell className="text-right">Low-Stock Level</TableHeaderCell>
                  <TableHeaderCell className="text-right">Stock Value</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.sku}</p>
                    </TableCell>
                    <TableCell>
                      <Link href={`/businesses/${item.tenantId}`} className="hover:underline">
                        {item.businessName ?? '—'}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {formatNumber(item.currentStock)} {item.unitSymbol}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(item.lowStockThreshold)} {item.unitSymbol}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.stockValue)}</TableCell>
                    <TableCell>
                      <StockStatusBadge status={item.status} />
                    </TableCell>
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
