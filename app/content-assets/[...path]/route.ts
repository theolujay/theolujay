import { getContentAsset } from '@/lib/content';

const mimeTypes: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const asset = getContentAsset(path);
  if (!asset) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(asset), {
    headers: {
      'Content-Type': mimeTypes[path.at(-1)!.split('.').at(-1)!.toLowerCase()],
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
