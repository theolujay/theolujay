import Link from 'next/link';
import {
  formatContentDate,
  getContentByKind,
  type ContentKind,
} from '@/lib/content';
import { SiteShell } from './site-shell';

const collectionCopy: Record<
  ContentKind,
  { title: string; path: string; description: string }
> = {
  notes: {
    title: 'notes',
    path: '~/notes',
    description: 'Fragments, things learned, and thoughts still taking shape.',
  },
  posts: {
    title: 'posts',
    path: '~/posts',
    description: 'Personal writing, stories, opinions, and occasional updates.',
  },
  articles: {
    title: 'articles',
    path: '~/articles',
    description: 'Longer technical explanations, field notes, and deep dives.',
  },
};

export function CollectionPage({ kind }: { kind: ContentKind }) {
  const items = getContentByKind(kind);
  const copy = collectionCopy[kind];

  return (
    <SiteShell>
      <main className="collection-main" id="content">
        <header className="collection-header">
          <div className="section-heading">
            <h2># {copy.title}</h2>
            <span>{copy.path}</span>
          </div>
          <p>{copy.description}</p>
        </header>

        {items.length ? (
          <ol className="content-list">
            {items.map((item) => (
              <li key={item.slug}>
                <time dateTime={item.date}>{formatContentDate(item.date)}</time>
                <div>
                  <Link href={item.url}>{item.title}</Link>
                  <p>{item.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-state">Nothing here yet. That is allowed.</p>
        )}
      </main>
    </SiteShell>
  );
}
