import { ShoppingCart } from 'lucide-react';
import { ComingSoon } from '@/components/ComingSoon';

export default function SalesPage() {
  return (
    <ComingSoon
      title="Sales"
      icon={ShoppingCart}
      description="Tenant sales already exist in the backend, but there's no cross-tenant Super Admin view yet. This page is reserved for it."
    />
  );
}
