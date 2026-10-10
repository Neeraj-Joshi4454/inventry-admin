import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import type { AccountStatus } from '@/types/auth';

type Tone = 'green' | 'gray' | 'red' | 'amber' | 'blue';

const toneClasses: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  gray: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'gray', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

const STATUS_TONE: Record<AccountStatus, Tone> = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
  SUSPENDED: 'red',
};

const STATUS_DOT: Record<AccountStatus, string> = {
  ACTIVE: 'bg-emerald-500',
  INACTIVE: 'bg-slate-400',
  SUSPENDED: 'bg-red-500',
};

export function StatusBadge({ status }: { status: AccountStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[status])} aria-hidden />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
