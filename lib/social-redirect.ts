import { getRequestExecutionContext } from 'vinext/shims/request-context';

export const socialDestinations = {
  email: 'mailto:theolujay@gmail.com',
  github: 'https://github.com/theolujay',
  hello: 'https://x.com/i/chat/906146874-2070815243052146688',
  linkedin: 'https://www.linkedin.com/in/theolujay',
  peakd: 'https://peakd.com/@olujay',
  resume: 'https://resume.theolujay.dev',
  retreev: 'https://retreev.app',
  twitter: 'https://x.com/theolujay',
  x: 'https://x.com/theolujay',
} as const;

type SocialDestination = keyof typeof socialDestinations;

const SOURCE_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/;

function getSource(value: string | null) {
  if (!value) return 'direct';

  const source = value.trim().toLowerCase();
  return SOURCE_PATTERN.test(source) ? source : 'direct';
}

function getReferrerHost(request: Request) {
  const referrer = request.headers.get('referer');

  if (!referrer) return 'direct';

  try {
    return new URL(referrer).host;
  } catch {
    return 'unknown';
  }
}

async function captureRedirect(
  request: Request,
  destination: SocialDestination,
) {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey || !host) return;

  const requestUrl = new URL(request.url);

  await fetch(`${host.replace(/\/$/, '')}/i/v0/e/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      event: 'social_redirect',
      distinct_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      properties: {
        $process_person_profile: false,
        $current_url: `${requestUrl.origin}${requestUrl.pathname}`,
        $host: requestUrl.host,
        $pathname: requestUrl.pathname,
        destination,
        source: getSource(requestUrl.searchParams.get('from')),
        referrer_host: getReferrerHost(request),
      },
    }),
  });
}

export function createSocialRedirect(destination: SocialDestination) {
  return function GET(request: Request) {
    const capture = captureRedirect(request, destination).catch(
      () => undefined,
    );
    const executionContext = getRequestExecutionContext();

    if (executionContext) {
      executionContext.waitUntil(capture);
    }

    return new Response(null, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        Location: socialDestinations[destination],
        'Referrer-Policy': 'no-referrer',
      },
    });
  };
}
