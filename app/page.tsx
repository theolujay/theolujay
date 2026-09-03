import { SiteShell } from '@/components/site-shell';
import { formatContentDate, getAllContent } from '@/lib/content';

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Joseph Ezekiel',
  alternateName: 'Olujay',
  jobTitle: 'Software Engineer',
  homeLocation: {
    '@type': 'Place',
    name: 'Lagos, Nigeria',
  },
  sameAs: [
    'https://github.com/theolujay',
    'https://www.linkedin.com/in/theolujay',
    'https://x.com/theolujay',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'Verboheit Consulting',
  },
  knowsAbout: [
    'Distributed systems',
    'Computer networking',
    'Go programming language',
    'Cloud native computing',
    'Photography',
  ],
};

export default function Home() {
  const recentContent = getAllContent().slice(0, 4);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <main id="content">
        <section className="intro" id="top" aria-label="Introduction">
          <p>
            I&apos;m a software engineer building backend systems. I enjoy
            playing chess, writing, and watching really good sci-fi/thriller
            films. You&apos;ve found my little corner.
          </p>
        </section>

        <section
          className="content-section"
          id="now"
          aria-labelledby="now-title"
        >
          <div className="section-heading">
            <h2 id="now-title"># now</h2>
            <span>~/now</span>
          </div>

          <ul className="entry-list">
            <li>
              <span className="entry-key">building →</span>
              <div>
                <a href="https://retreev.app">retreev.app</a>
                <p>
                  Google Drive in. Memorable galleries out. Find yourself with a
                  selfie.
                </p>
              </div>
            </li>
            <li>
              <span className="entry-key">based →</span>
              <span>Lagos, Nigeria</span>
            </li>
          </ul>
        </section>

        <section
          className="content-section"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-heading">
            <h2 id="work-title"># work</h2>
            <span>~/work</span>
          </div>

          <ul className="entry-list">
            <li>
              <span className="entry-key">current →</span>
              <div>
                <strong>Verboheit Consulting</strong>
                <p>I lead the technical team delivering solutions.</p>
              </div>
            </li>
            <li>
              <span className="entry-key">before →</span>
              <span>industrial automation engineering</span>
            </li>
          </ul>
        </section>

        <section
          className="content-section"
          id="fascinations"
          aria-labelledby="fascinations-title"
        >
          <div className="section-heading">
            <h2 id="fascinations-title"># fascinations</h2>
            <span>~/fascinations</span>
          </div>

          <ul className="entry-list">
            <li>
              <span className="entry-key">wonders →</span>
              <span>outer space, time travel, photography</span>
            </li>
            <li>
              <span className="entry-key">software →</span>
              <span>
                distributed systems, networking, Go, cloud-native computing
              </span>
            </li>
          </ul>
        </section>

        <section
          className="content-section"
          id="away"
          aria-labelledby="away-title"
        >
          <div className="section-heading">
            <h2 id="away-title"># away from the keyboard</h2>
            <span>~/off-screen</span>
          </div>

          <ul className="entry-list compact-list">
            <li>
              <span className="entry-key">chess →</span>
              <span>Lichess, Chess.com</span>
            </li>
            <li>
              <span className="entry-key">music →</span>
              <span>NF, Mateus Asato, Martin Miller, Khalid, Polyphia</span>
            </li>
            <li>
              <span className="entry-key">reading →</span>
              <span>Robert Greene, Cal Newport, Mark Manson.</span>
            </li>
            <li>
              <span className="entry-key">watching →</span>
              <span>Silo (TV Series)</span>
            </li>
          </ul>
        </section>

        <section
          className="content-section"
          id="writing"
          aria-labelledby="writing-title"
        >
          <div className="section-heading">
            <h2 id="writing-title"># recently</h2>
            <span>~/writing</span>
          </div>

          {recentContent.length ? (
            <ul className="note-list">
              {recentContent.map((item) => (
                <li key={`${item.kind}-${item.slug}`}>
                  <a href={item.url}>{item.title}</a>
                  <time dateTime={item.date}>
                    {formatContentDate(item.date)}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">
              The first entry is still taking shape.
            </p>
          )}
        </section>
      </main>
    </SiteShell>
  );
}
