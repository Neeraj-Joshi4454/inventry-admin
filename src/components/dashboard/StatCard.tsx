import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  isLoading,
  tone = 'slate',
}: {
  label: string;
  /** A count, or an already-formatted string such as a currency amount. */
  value?: number | string;
  hint?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  tone?: 'slate' | 'emerald' | 'red' | 'amber';
}) {
  const toneClasses = {
    slate: 'bg-slate-100 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-14" />
          ) : (
            <p className="mt-1 truncate text-2xl font-semibold text-slate-900">{value ?? 0}</p>
          )}
          {hint && !isLoading && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', toneClasses)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
