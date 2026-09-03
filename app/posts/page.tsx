import type { Metadata } from 'next';
import { CollectionPage } from '@/components/collection-page';

export const metadata: Metadata = {
  title: 'Posts — Olujay',
  description: 'Personal writing, stories, opinions, and occasional updates.',
  alternates: { canonical: '/posts' },
};

export default function PostsPage() {
  return <CollectionPage kind="posts" />;
}
