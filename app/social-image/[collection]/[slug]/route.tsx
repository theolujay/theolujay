import { ImageResponse } from 'next/og';
import { getContentItem } from '@/lib/content';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ collection: string; slug: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { collection, slug } = await params;
  const item = getContentItem(collection, slug);

  if (!item) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(
    <div
      style={{
        alignItems: 'stretch',
        background: '#0b0f1a',
        color: '#e6e9f2',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        height: '100%',
        justifyContent: 'space-between',
        padding: '68px 76px',
        width: '100%',
      }}
    >
      <div
        style={{
          color: '#8c93a6',
          display: 'flex',
          fontSize: 25,
          letterSpacing: '-0.02em',
        }}
      >
        ~/{item.kind}/{item.slug}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div
          style={{
            color: '#ffffff',
            display: 'flex',
            fontSize: item.title.length > 48 ? 48 : 58,
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 1.08,
            maxWidth: 1020,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            color: '#aeb5c5',
            display: 'flex',
            fontSize: 25,
            lineHeight: 1.45,
            maxWidth: 1000,
          }}
        >
          {item.summary}
        </div>
      </div>

      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          fontSize: 23,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ color: '#91a7ff', display: 'flex' }}>
          Joseph &quot;Olujay&quot; Ezekiel
        </div>
        <div style={{ color: '#8c93a6', display: 'flex' }}>{item.date}</div>
      </div>

      <div
        style={{
          background: '#4169ff',
          bottom: 0,
          display: 'flex',
          height: 10,
          left: 0,
          position: 'absolute',
          width: '100%',
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=86400',
      },
    },
  );
}
