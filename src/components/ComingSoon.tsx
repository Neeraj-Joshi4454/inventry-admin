import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';

export function ComingSoon({
  title,
  description,
  icon: Icon = Construction,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <Card className="mt-4">
        <EmptyState
          icon={Icon}
          title="Not built yet"
          description={
            description ??
            `${title} management is intentionally out of scope for this phase of the Super Admin panel. This page is reserved for it.`
          }
        />
      </Card>
    </div>
  );
}
