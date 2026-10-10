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
import { ComingSoonPanel } from '@/components/dashboard/ComingSoonPanel';
import { useTenantCountsQuery } from '@/hooks/useTenants';

export default function DashboardPage() {
  const { data: counts, isLoading } = useTenantCountsQuery();

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
        {/* Products/Sales/Purchases/Low-stock have no backing API yet — those
            modules are intentionally out of scope for this phase (see
            README "Known limitations"). Shown as reserved, honestly
            unavailable cards rather than fabricated numbers. */}
        <StatCard label="Total Products" icon={Package} unavailable />
        <StatCard label="Total Sales" icon={ShoppingCart} unavailable />
        <StatCard label="Total Purchases" icon={Truck} unavailable />
        <StatCard label="Low Stock Products" icon={AlertTriangle} unavailable tone="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBusinesses />
        </div>
        <div className="space-y-4">
          <ComingSoonPanel
            title="Recent Sales"
            icon={ShoppingCart}
            note="Cross-tenant sales visibility isn't built yet."
          />
          <ComingSoonPanel
            title="Recent Purchases"
            icon={Truck}
            note="Purchases module isn't built yet."
          />
        </div>
      </div>

      <div className="mt-4">
        <ComingSoonPanel
          title="Low-Stock Summary"
          icon={AlertTriangle}
          note="Inventory module isn't built yet."
        />
      </div>
    </div>
  );
}
