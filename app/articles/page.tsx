import type { Metadata } from 'next';
import { CollectionPage } from '@/components/collection-page';
import { createPageMetadata } from '@/lib/site';

export const metadata: Metadata = createPageMetadata(
  'Articles • Olujay',
  'Longer technical explanations, field notes, and deep dives.',
  '/articles',
);

export default function ArticlesPage() {
  return <CollectionPage kind="articles" />;
}
