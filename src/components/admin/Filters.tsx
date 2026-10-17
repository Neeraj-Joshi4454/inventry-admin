'use client';

import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTenantsQuery } from '@/hooks/useTenants';

/** The row of filters above every cross-business list. */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
      {children}
    </div>
  );
}

export function SearchFilter({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder={placeholder}
        className="pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Narrows a list to one business. */
export function BusinessFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (tenantId: string) => void;
}) {
  const { data } = useTenantsQuery({ page: 1, limit: 100, sortBy: 'businessName', sortOrder: 'asc' });

  return (
    <div className="w-full lg:w-56">
      <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Business">
        <option value="">All businesses</option>
        {data?.data.map((tenant) => (
          <option key={tenant._id} value={tenant._id}>
            {tenant.businessName}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function SelectFilter({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="w-full lg:w-44">
      <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        aria-label="From date"
        className="lg:w-40"
        value={from}
        max={to || undefined}
        onChange={(e) => onChange({ from: e.target.value, to })}
      />
      <span className="text-sm text-slate-400">to</span>
      <Input
        type="date"
        aria-label="To date"
        className="lg:w-40"
        value={to}
        min={from || undefined}
        onChange={(e) => onChange({ from, to: e.target.value })}
      />
    </div>
  );
}
