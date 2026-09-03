import { getAllContent } from '@/lib/content';
import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const items = getAllContent();
  const entries = items
    .map((item) => {
      const url = new URL(item.url, SITE_URL).toString();
      const published = new Date(`${item.date}T00:00:00Z`).toUTCString();

      return `
        <item>
          <title>${escapeXml(item.title)}</title>
          <link>${escapeXml(url)}</link>
          <guid isPermaLink="true">${escapeXml(url)}</guid>
          <pubDate>${published}</pubDate>
          <dc:creator>${escapeXml(AUTHOR_NAME)}</dc:creator>
          <category>${escapeXml(item.kind)}</category>
          <description>${escapeXml(item.summary)}</description>
        </item>`;
    })
    .join('');

  const lastBuildDate = items.length
    ? new Date(`${items[0].date}T00:00:00Z`).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <channel>
        <title>${escapeXml(SITE_NAME)}</title>
        <link>${escapeXml(SITE_URL)}</link>
        <description>${escapeXml(SITE_DESCRIPTION)}</description>
        <language>en-ng</language>
        <lastBuildDate>${lastBuildDate}</lastBuildDate>
        ${entries}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
