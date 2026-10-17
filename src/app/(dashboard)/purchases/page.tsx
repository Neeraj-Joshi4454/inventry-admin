import { PageHeader } from '@/components/admin/PageHeader';
import { DocumentList } from '@/components/admin/DocumentList';

export default function PurchasesPage() {
  return (
    <div>
      <PageHeader
        title="Purchases"
        description="Every purchase recorded by every business, newest first."
      />
      <DocumentList kind="purchase" />
    </div>
  );
}
