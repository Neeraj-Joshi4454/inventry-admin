'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
import { PageHeader } from '@/components/admin/PageHeader';
import {
  BusinessFilter,
  FilterBar,
  SearchFilter,
  SelectFilter,
} from '@/components/admin/Filters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAdminProductsQuery } from '@/hooks/useAdmin';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [isActive, setIsActive] = useState<'' | 'true' | 'false'>('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching } = useAdminProductsQuery({
    page,
    limit: 20,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(tenantId ? { tenantId } : {}),
    ...(isActive ? { isActive } : {}),
  });

  const filtered = !!(debouncedSearch || tenantId || isActive);

  return (
    <div>
      <PageHeader title="Products" description="Product catalogue across every business." />

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
            label="All products"
            value={isActive}
            onChange={(v) => {
              setIsActive(v as '' | 'true' | 'false');
              setPage(1);
            }}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
        </FilterBar>

        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={filtered ? 'Try adjusting your search or filters.' : undefined}
          />
        ) : (
          <>
            <Table className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Business</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell className="text-right">Purchase Price</TableHeaderCell>
                  <TableHeaderCell className="text-right">Selling Price</TableHeaderCell>
                  <TableHeaderCell className="text-right">GST</TableHeaderCell>
                  <TableHeaderCell className="text-right">Stock</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.sku}</p>
                    </TableCell>
                    <TableCell>
                      <Link href={`/businesses/${product.tenantId}`} className="hover:underline">
                        {product.businessName ?? '—'}
                      </Link>
                    </TableCell>
                    <TableCell>{product.categoryName ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.purchasePrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.sellingPrice)}
                    </TableCell>
                    <TableCell className="text-right">{product.taxRate}%</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(product.currentStock)} {product.unitSymbol}
                    </TableCell>
                    <TableCell>
                      <Badge tone={product.isActive ? 'green' : 'gray'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
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
