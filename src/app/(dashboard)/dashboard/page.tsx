'use client';

import {
  Building2,
  CheckCircle2,
  XCircle,
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentBusinesses } from '@/components/dashboard/RecentBusinesses';
import { LowStockSummary, RecentDocuments } from '@/components/dashboard/RecentActivity';
import { useTenantCountsQuery } from '@/hooks/useTenants';
import { useAdminOverviewQuery } from '@/hooks/useAdmin';
import { formatCurrency } from '@/lib/utils/format';

export default function DashboardPage() {
  const { data: counts, isLoading } = useTenantCountsQuery();
  const { data: overview, isLoading: overviewLoading } = useAdminOverviewQuery();

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Platform-wide overview across all businesses.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Total Businesses"
          value={counts?.total}
          icon={Building2}
          isLoading={isLoading}
        />
        <StatCard
          label="Active Businesses"
          value={counts?.active}
          icon={CheckCircle2}
          isLoading={isLoading}
          tone="emerald"
        />
        <StatCard
          label="Inactive Businesses"
          value={counts?.inactive}
          icon={XCircle}
          isLoading={isLoading}
          tone="slate"
        />
        <StatCard
          label="Total Products"
          value={overview?.stock.products}
          icon={Package}
          isLoading={overviewLoading}
        />
        <StatCard
          label="Total Sales"
          value={formatCurrency(overview?.sales.amount)}
          hint={overview ? `${overview.sales.count} sales` : undefined}
          icon={ShoppingCart}
          isLoading={overviewLoading}
          tone="emerald"
        />
        <StatCard
          label="Total Purchases"
          value={formatCurrency(overview?.purchases.amount)}
          hint={overview ? `${overview.purchases.count} purchases` : undefined}
          icon={Truck}
          isLoading={overviewLoading}
        />
        <StatCard
          label="Low Stock Products"
          value={overview ? overview.stock.lowStock + overview.stock.outOfStock : undefined}
          hint={overview ? `${overview.stock.outOfStock} out of stock` : undefined}
          icon={AlertTriangle}
          isLoading={overviewLoading}
          tone="amber"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBusinesses />
        </div>
        <div className="space-y-4">
          <RecentDocuments
            title="Recent Sales"
            href="/sales"
            icon={ShoppingCart}
            emptyTitle="No sales yet"
            isLoading={overviewLoading}
            items={overview?.recentSales.map((s) => ({
              id: s._id,
              number: s.saleNumber,
              businessName: s.businessName,
              date: s.saleDate,
              amount: s.totalAmount,
              paymentStatus: s.paymentStatus,
            }))}
          />
          <RecentDocuments
            title="Recent Purchases"
            href="/purchases"
            icon={Truck}
            emptyTitle="No purchases yet"
            isLoading={overviewLoading}
            items={overview?.recentPurchases.map((p) => ({
              id: p._id,
              number: p.purchaseNumber,
              businessName: p.businessName,
              date: p.purchaseDate,
              amount: p.totalAmount,
              paymentStatus: p.paymentStatus,
            }))}
          />
        </div>
      </div>

      <div className="mt-4">
        <LowStockSummary
          items={overview?.lowStock}
          isLoading={overviewLoading}
          icon={AlertTriangle}
        />
      </div>
    </div>
  );
}
