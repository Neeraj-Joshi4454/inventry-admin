import { Badge } from '@/components/ui/Badge';
import type { PaymentStatus, StockStatus } from '@/types/admin';

const STOCK: Record<StockStatus, { label: string; tone: 'green' | 'amber' | 'red' }> = {
  IN_STOCK: { label: 'In stock', tone: 'green' },
  LOW_STOCK: { label: 'Low stock', tone: 'amber' },
  OUT_OF_STOCK: { label: 'Out of stock', tone: 'red' },
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const { label, tone } = STOCK[status] ?? STOCK.IN_STOCK;
  return <Badge tone={tone}>{label}</Badge>;
}

const PAYMENT: Record<PaymentStatus, { label: string; tone: 'green' | 'amber' | 'red' | 'blue' }> = {
  PAID: { label: 'Paid', tone: 'green' },
  PARTIAL: { label: 'Partial', tone: 'amber' },
  UNPAID: { label: 'Unpaid', tone: 'red' },
  CREDIT: { label: 'Credit', tone: 'blue' },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, tone } = PAYMENT[status] ?? { label: status, tone: 'blue' as const };
  return <Badge tone={tone}>{label}</Badge>;
}

export const PAYMENT_STATUS_OPTIONS = (Object.keys(PAYMENT) as PaymentStatus[]).map((value) => ({
  value,
  label: PAYMENT[value].label,
}));

export const STOCK_STATUS_OPTIONS = (Object.keys(STOCK) as StockStatus[]).map((value) => ({
  value,
  label: STOCK[value].label,
}));
