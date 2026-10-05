import {
  formatContentDate,
  getContentByKind,
  type ContentKind,
} from '@/lib/content';
import { SiteShell } from './site-shell';
import { TrackedLink } from './tracked-link';

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
                <TrackedLink
                  className="content-list-item"
                  href={item.url}
                  event="content_selected"
                  properties={{
                    content_kind: item.kind,
                    content_slug: item.slug,
                    source: 'collection_list',
                  }}
                >
                  <time dateTime={item.date}>{formatContentDate(item.date)}</time>
                  <div>
                    <span>{item.title}</span>
                    <p>{item.summary}</p>
                  </div>
                </TrackedLink>
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
