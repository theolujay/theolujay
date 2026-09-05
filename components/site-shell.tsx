/* oxlint-disable next/no-html-link-for-pages -- Vinext's Link shim currently swallows internal navigation. */
import type { ReactNode } from 'react';
import { TrackedLink } from './tracked-link';

const navigation = [
  { label: 'notes', href: '/notes' },
  { label: 'posts', href: '/posts' },
  { label: 'articles', href: '/articles' },
  { label: 'github', href: '/github?from=site-nav', outbound: true },
  { label: 'linkedin', href: '/linkedin?from=site-nav', outbound: true },
  { label: 'twitter', href: '/x?from=site-nav', outbound: true },
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#content">
        skip to content
      </a>

      <div className="page-shell">
        <header className="site-header">
          <div>
            <h1>
              <a href="/">Joseph &quot;Olujay&quot; Ezekiel</a>
              <span className="cursor" aria-hidden="true" />
            </h1>

            <nav aria-label="Primary navigation">
              {navigation.map((link) => (
                <TrackedLink
                  key={link.label}
                  href={link.href}
                  event={
                    link.outbound
                      ? 'outbound_link_clicked'
                      : 'navigation_clicked'
                  }
                  properties={
                    link.outbound
                      ? {
                          destination: link.label,
                          placement: 'primary_navigation',
                        }
                      : { destination: link.label }
                  }
                >
                  {link.label}
                </TrackedLink>
              ))}
            </nav>
          </div>
          <span className="home-mark" aria-hidden="true">
            ~
          </span>
        </header>

        {children}

        <footer>
          <span>© 2026 Joseph Ezekiel</span>
          <TrackedLink
            href="/hello?from=site-footer"
            event="outbound_link_clicked"
            properties={{ destination: 'contact', placement: 'footer' }}
          >
            say hello →
          </TrackedLink>
        </footer>
      </div>
    </>
  );
}
