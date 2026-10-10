import { BusinessDetailClient } from '@/components/businesses/BusinessDetailClient';

// Next.js 16: `params` is always a Promise in page components.
export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BusinessDetailClient id={id} />;
}
