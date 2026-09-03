/* oxlint-disable next/no-html-link-for-pages -- Vinext's Link shim currently swallows internal navigation. */
import type { ReactNode } from 'react';

const navigation = [
  { label: 'notes', href: '/notes' },
  { label: 'posts', href: '/posts' },
  { label: 'articles', href: '/articles' },
  { label: 'github', href: 'https://github.com/theolujay' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/theolujay' },
  { label: 'twitter', href: 'https://x.com/theolujay' },
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
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
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
          <a href="https://x.com/i/chat/906146874-2070815243052146688">
            say hello →
          </a>
        </footer>
      </div>
    </>
  );
}
