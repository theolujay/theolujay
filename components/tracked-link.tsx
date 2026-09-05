'use client';

import posthog from 'posthog-js';
import type { ComponentProps } from 'react';

type TrackedLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  event: 'content_selected' | 'navigation_clicked' | 'outbound_link_clicked';
  properties: Record<string, string>;
};

export function TrackedLink({
  event,
  properties,
  onClick,
  children,
  href,
  ...props
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      {...props}
      onClick={(clickEvent) => {
        onClick?.(clickEvent);

        if (
          !clickEvent.defaultPrevented &&
          process.env.POSTHOG_KEY &&
          process.env.POSTHOG_HOST
        ) {
          posthog.capture(event, properties);
        }
      }}
    >
      {children}
    </a>
  );
}
