'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHeaderCell } from '@/components/ui/Table';

export function SortableHeader<TField extends string>({
  field,
  label,
  activeField,
  order,
  onChange,
}: {
  field: TField;
  label: string;
  activeField: TField | undefined;
  order: 'asc' | 'desc';
  onChange: (field: TField, order: 'asc' | 'desc') => void;
}) {
  const isActive = activeField === field;
  const Icon = isActive ? (order === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHeaderCell>
      <button
        type="button"
        onClick={() => onChange(field, isActive && order === 'asc' ? 'desc' : 'asc')}
        className="inline-flex items-center gap-1 hover:text-slate-700"
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </TableHeaderCell>
  );
}
