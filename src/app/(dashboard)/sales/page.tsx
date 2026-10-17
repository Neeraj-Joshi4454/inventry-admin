import { PageHeader } from '@/components/admin/PageHeader';
import { DocumentList } from '@/components/admin/DocumentList';

export default function SalesPage() {
  return (
    <div>
      <PageHeader title="Sales" description="Every sale recorded by every business, newest first." />
      <DocumentList kind="sale" />
    </div>
  );
}
