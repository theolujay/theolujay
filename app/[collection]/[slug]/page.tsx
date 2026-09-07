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
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from '@/lib/site';

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
    ? { url: new URL(item.cover, SITE_URL).toString(), alt: item.title }
    : {
        url: new URL(
          `/social-image/${encodeURIComponent(collection)}/${encodeURIComponent(slug)}`,
          SITE_URL,
        ).toString(),
        width: 1200,
        height: 630,
        alt: item.title,
      };

  return {
    title: `${item.title} • Olujay`,
    description: item.summary,
    alternates: { canonical: item.url },
    openGraph: {
      title: item.title,
      description: item.summary,
      type: 'article',
      url: item.url,
      siteName: SITE_NAME,
      locale: 'en_NG',
      publishedTime: `${item.date}T00:00:00Z`,
      authors: [AUTHOR_NAME],
      tags: item.tags,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.summary,
      creator: '@theolujay',
      images: [image],
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

  const content = await renderContent(item);
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

          <div className="prose">{content}</div>

          <a className="back-link" href={`/${item.kind}`}>
            ← all {item.kind}
          </a>
        </article>
      </main>
    </SiteShell>
  );
}
