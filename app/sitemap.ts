import type { MetadataRoute } from 'next';
import { getAllContent } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/notes`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/posts`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/articles`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const contentRoutes: MetadataRoute.Sitemap = getAllContent().map((item) => ({
    url: new URL(item.url, SITE_URL).toString(),
    lastModified: new Date(`${item.date}T00:00:00Z`),
    changeFrequency: 'monthly',
    priority: item.kind === 'notes' ? 0.6 : 0.7,
  }));

  return [...staticRoutes, ...contentRoutes];
}
