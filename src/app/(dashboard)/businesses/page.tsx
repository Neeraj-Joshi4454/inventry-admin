'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
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
import { SortableHeader } from '@/components/businesses/SortableHeader';
import { BusinessRowActions } from '@/components/businesses/BusinessRowActions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTenantsQuery } from '@/hooks/useTenants';
import { formatDate } from '@/lib/utils/format';
import type { AccountStatus } from '@/types/auth';
import type { ListTenantsParams } from '@/lib/api/tenants';

type SortField = 'businessName' | 'createdAt';

export default function BusinessesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AccountStatus | ''>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useDebouncedValue(search);

  const params: ListTenantsParams = {
    page,
    limit: 10,
    sortBy,
    sortOrder,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
  };

  const { data, isLoading, isFetching } = useTenantsQuery(params);

  function handleSortChange(field: SortField, order: 'asc' | 'desc') {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Businesses</h1>
          <p className="mt-1 text-sm text-slate-500">Manage tenant businesses on the platform.</p>
        </div>
        <Link href="/businesses/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Business
          </Button>
        </Link>
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by business name, owner, or mobile..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as AccountStatus | '');
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No businesses found"
            description={
              debouncedSearch || status
                ? 'Try adjusting your search or filter.'
                : 'Get started by creating the first business.'
            }
            action={
              !debouncedSearch && !status ? (
                <Link href="/businesses/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    New Business
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <Table className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <TableHead>
                <TableRow>
                  <SortableHeader
                    field="businessName"
                    label="Business Name"
                    activeField={sortBy}
                    order={sortOrder}
                    onChange={handleSortChange}
                  />
                  <TableHeaderCell>Owner</TableHeaderCell>
                  <TableHeaderCell>Mobile</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <SortableHeader
                    field="createdAt"
                    label="Created Date"
                    activeField={sortBy}
                    order={sortOrder}
                    onChange={handleSortChange}
                  />
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((tenant) => (
                  <TableRow key={tenant._id}>
                    <TableCell className="font-medium text-slate-900">
                      <Link href={`/businesses/${tenant._id}`} className="hover:underline">
                        {tenant.businessName}
                      </Link>
                    </TableCell>
                    <TableCell>{tenant.ownerName}</TableCell>
                    <TableCell>{tenant.mobileNumber}</TableCell>
                    <TableCell>
                      <StatusBadge status={tenant.status} />
                    </TableCell>
                    <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <BusinessRowActions tenant={tenant} />
                      </div>
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
