'use client';

import { Package, Boxes, ShoppingCart, Truck, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTenantStatsQuery } from '@/hooks/useAdmin';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

/** Backend-computed counters for one business (GET /admin/tenants/:id/stats). */
export function BusinessStatsGrid({ tenantId }: { tenantId: string }) {
  const { data, isLoading, isError } = useTenantStatsQuery(tenantId);

  const metrics = data
    ? [
        {
          label: 'Products',
          icon: Package,
          value: formatNumber(data.stock.products),
          hint: `${data.stock.lowStock} low · ${data.stock.outOfStock} out of stock`,
        },
        {
          label: 'Current Inventory',
          icon: Boxes,
          value: formatCurrency(data.stock.stockValue),
          hint: `${formatNumber(data.stock.stockQuantity)} units on hand`,
        },
        {
          label: 'Sales',
          icon: ShoppingCart,
          value: formatCurrency(data.sales.amount),
          hint: `${data.sales.count} sales · ${formatCurrency(data.sales.due)} due`,
        },
        {
          label: 'Purchases',
          icon: Truck,
          value: formatCurrency(data.purchases.amount),
          hint: `${data.purchases.count} purchases · ${formatCurrency(data.purchases.due)} due`,
        },
        { label: 'Customers', icon: Users, value: formatNumber(data.customers) },
        { label: 'Suppliers', icon: Building2, value: formatNumber(data.suppliers) },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-sm text-red-600">Couldn&apos;t load statistics for this business.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              : metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex flex-col items-center rounded-lg border border-slate-200 px-2 py-4 text-center"
                  >
                    <metric.icon className="h-5 w-5 text-slate-400" />
                    <p className="mt-2 text-lg font-semibold text-slate-900">{metric.value}</p>
                    <p className="text-xs font-medium text-slate-500">{metric.label}</p>
                    {metric.hint && <p className="mt-0.5 text-[11px] text-slate-400">{metric.hint}</p>}
                  </div>
                ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
