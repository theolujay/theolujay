import type { Metadata } from 'next';
import { CollectionPage } from '@/components/collection-page';
import { createPageMetadata } from '@/lib/site';

export const metadata: Metadata = createPageMetadata(
  'Posts • Olujay',
  'Personal writing, stories, opinions, and occasional updates.',
  '/posts',
);

export default function PostsPage() {
  return <CollectionPage kind="posts" />;
}
