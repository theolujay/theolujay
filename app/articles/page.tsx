import type { Metadata } from 'next';
import { CollectionPage } from '@/components/collection-page';

export const metadata: Metadata = {
  title: 'Articles — Olujay',
  description: 'Longer technical explanations, field notes, and deep dives.',
  alternates: { canonical: '/articles' },
};

export default function ArticlesPage() {
  return <CollectionPage kind="articles" />;
}
