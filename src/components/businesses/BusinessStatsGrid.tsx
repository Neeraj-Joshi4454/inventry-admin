import { Package, Boxes, ShoppingCart, Truck, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const METRICS = [
  { label: 'Products', icon: Package },
  { label: 'Current Inventory', icon: Boxes },
  { label: 'Sales', icon: ShoppingCart },
  { label: 'Purchases', icon: Truck },
  { label: 'Customers', icon: Users },
  { label: 'Suppliers', icon: Building2 },
];

/**
 * These six metrics are explicitly required on the business detail page,
 * but their backing modules (products/inventory/sales/purchases/customers/
 * suppliers) aren't built yet and there's no cross-tenant aggregate
 * endpoint for Super Admin even where a module partially exists (e.g.
 * Sales). Shown honestly as reserved/unavailable rather than computed on
 * the frontend or backed by a fabricated number.
 */
export function BusinessStatsGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-center rounded-lg border border-dashed border-slate-200 py-4 text-center"
            >
              <metric.icon className="h-5 w-5 text-slate-300" />
              <p className="mt-2 text-lg font-semibold text-slate-300">—</p>
              <p className="text-xs text-slate-400">{metric.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Not available yet — Products, Inventory, Sales, Purchases, Customers, and Suppliers
          management aren&apos;t built in this phase.
        </p>
      </CardContent>
    </Card>
  );
}
