import type { Metadata } from 'next';
import { CollectionPage } from '@/components/collection-page';

export const metadata: Metadata = {
  title: 'Notes — Olujay',
  description: 'Fragments, things learned, and thoughts still taking shape.',
  alternates: { canonical: '/notes' },
};

export default function NotesPage() {
  return <CollectionPage kind="notes" />;
}
