import posthog from 'posthog-js';

const posthogKey = process.env.POSTHOG_KEY;
const posthogHost = process.env.POSTHOG_HOST;

if (!posthogKey || !posthogHost) {
  if (process.env.NODE_ENV !== 'production') {
    const missingVariable = posthogKey ? 'POSTHOG_HOST' : 'POSTHOG_KEY';

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    );
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-05-30',
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
  });
}
