import type { Metadata } from 'next';
import { CollectionPage } from '@/components/collection-page';
import { createPageMetadata } from '@/lib/site';

export const metadata: Metadata = createPageMetadata(
  'Notes • Olujay',
  'Fragments, things learned, and thoughts still taking shape.',
  '/notes',
);

export default function NotesPage() {
  return <CollectionPage kind="notes" />;
}
