import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/site-shell';
import {
  contentKinds,
  formatContentDate,
  getAllContent,
  getContentItem,
  renderContent,
} from '@/lib/content';
import { AUTHOR_NAME, SITE_URL } from '@/lib/site';

type PageProps = {
  params: Promise<{ collection: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllContent().map((item) => ({
    collection: item.kind,
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { collection, slug } = await params;
  const item = getContentItem(collection, slug);

  if (!item) return {};

  const image = item.cover
    ? new URL(item.cover, SITE_URL).toString()
    : undefined;

  return {
    title: `${item.title} — Olujay`,
    description: item.summary,
    alternates: { canonical: item.url },
    openGraph: {
      title: item.title,
      description: item.summary,
      type: 'article',
      url: item.url,
      publishedTime: `${item.date}T00:00:00Z`,
      authors: [AUTHOR_NAME],
      images: image ? [{ url: image, alt: item.title }] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: item.title,
      description: item.summary,
      images: image ? [image] : [],
    },
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { collection, slug } = await params;

  if (!contentKinds.includes(collection as (typeof contentKinds)[number])) {
    notFound();
  }

  const item = getContentItem(collection, slug);
  if (!item) notFound();

  const html = await renderContent(item);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': item.kind === 'articles' ? 'TechArticle' : 'BlogPosting',
    headline: item.title,
    description: item.summary,
    datePublished: item.date,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    url: new URL(item.url, SITE_URL).toString(),
  };

  return (
    <SiteShell>
      <main className="article-main" id="content">
        <article>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
          />

          <header className="article-header">
            <p className="article-path">~{item.url}</p>
            <h2>{item.title}</h2>
            <div className="article-meta">
              <time dateTime={item.date}>{formatContentDate(item.date)}</time>
              {item.tags.length ? <span>{item.tags.join(' · ')}</span> : null}
            </div>
          </header>

          {item.cover ? (
            <Image
              className="article-cover"
              src={item.cover}
              alt={item.title}
              width={1200}
              height={675}
              unoptimized
            />
          ) : null}

          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

          <a className="back-link" href={`/${item.kind}`}>
            ← all {item.kind}
          </a>
        </article>
      </main>
    </SiteShell>
  );
}
