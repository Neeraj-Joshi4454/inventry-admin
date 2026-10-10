'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { useTenantsQuery } from '@/hooks/useTenants';
import { Building2 } from 'lucide-react';

export function RecentBusinesses() {
  const { data, isLoading } = useTenantsQuery({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Businesses</CardTitle>
        <Link href="/businesses" className="text-xs font-medium text-slate-500 hover:text-slate-800">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState icon={Building2} title="No businesses yet" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.data.map((tenant) => (
              <li key={tenant._id}>
                <Link
                  href={`/businesses/${tenant._id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {tenant.businessName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tenant.ownerName} · {formatDate(tenant.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={tenant.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
