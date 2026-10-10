import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function ComingSoonPanel({
  title,
  icon: Icon,
  note,
}: {
  title: string;
  icon: LucideIcon;
  note: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-8 text-center">
        <Icon className="h-6 w-6 text-slate-300" />
        <p className="mt-2 text-sm text-slate-400">{note}</p>
      </CardContent>
    </Card>
  );
}
