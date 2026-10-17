export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number | undefined | null): string {
  return currencyFormatter.format(amount ?? 0);
}

export function formatNumber(value: number | undefined | null): string {
  return (value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 3 });
}

/** A `<input type="date">` value as the start / end of that local day, in ISO. */
export function dayStartIso(date: string): string | undefined {
  return date ? new Date(`${date}T00:00:00`).toISOString() : undefined;
}

export function dayEndIso(date: string): string | undefined {
  return date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined;
}
