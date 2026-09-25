import { SiteShell } from '@/components/site-shell';
import { TrackedLink } from '@/components/tracked-link';
import { formatContentDate, getAllContent } from '@/lib/content';

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Joseph Ezekiel',
  alternateName: 'Olujay',
  jobTitle: 'Backend & Platform Engineer',
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
    name: 'Retreev',
  },
  knowsAbout: [
    'Distributed systems',
    'Computer networking',
    'Go programming language',
    'Cloud native computing',
    'Photography',
  ],
};

const featuredProjects = [
  {
    slug: 'appa',
    title: 'Appa',
    summary:
      'A self-hosted deployment platform that provisions VPS fleets with Ansible and deploys apps from Git or local source using Railpack, BuildKit, and Caddy.',
    technologies: ['Go', 'Ansible', 'BuildKit', 'Caddy'],
    links: [
      {
        label: 'GitHub ↗',
        href: 'https://github.com/theolujay/appa',
        destination: 'appa_github',
        external: true,
      },
    ],
  },
  {
    slug: 'resumable-upload',
    title: 'Resumable Upload Server',
    summary:
      'A Go server implementing tus uploads, including offset validation, incremental PATCH requests, and recovery after interrupted transfers.',
    technologies: ['Go', 'HTTP', 'tus'],
    links: [
      {
        label: 'GitHub ↗',
        href: 'https://github.com/theolujay/resumable-upload',
        destination: 'resumable_upload_github',
        external: true,
      },
      {
        label: 'Read the article →',
        href: '/articles/resumable-upload',
        destination: 'resumable-upload',
        external: false,
      },
    ],
  },
  {
    slug: 'paystack-api-wrapper',
    title: 'Paystack Python SDK',
    summary:
      'A type-safe Python client for Paystack APIs, built test-first with about 99% test coverage.',
    technologies: ['Python', 'API design', 'Testing'],
    links: [
      {
        label: 'GitHub ↗',
        href: 'https://github.com/theolujay/paystack-api-wrapper',
        destination: 'paystack_api_wrapper_github',
        external: true,
      },
    ],
  },
];

const resumeDownloadName = 'Joseph-Ezekiel-Software-Engineer-Resume.pdf';

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
          <p className="intro-role">Backend &amp; Platform Engineer</p>
          <p>
            Software engineer focused on distributed systems,
            networking, infrastructure, and reliability. I&apos;m currently
            building Retreev, and this is where I share what I learn along the
            way.
          </p>
          <div className="intro-actions">
            <TrackedLink
              href="/software-engineering-resume.pdf"
              download={resumeDownloadName}
              className="action-link action-link-primary"
              event="navigation_clicked"
              properties={{ destination: 'resume', placement: 'home_intro' }}
            >
              download resume ↓
            </TrackedLink>
            <TrackedLink
              href="/hello?from=home-intro"
              className="action-link"
              event="outbound_link_clicked"
              properties={{ destination: 'contact', placement: 'home_intro' }}
            >
              say hello →
            </TrackedLink>
          </div>
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
                <TrackedLink
                  href="/retreev?from=homepage"
                  event="outbound_link_clicked"
                  properties={{ destination: 'retreev', placement: 'home_now' }}
                >
                  retreev.app
                </TrackedLink>
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
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="section-heading">
            <h2 id="experience-title"># experience</h2>
            <span>~/experience</span>
          </div>

          <ul className="entry-list">
            <li>
              <span className="entry-key">Jun 2026 – now →</span>
              <div>
                <strong>Backend &amp; Platform Engineer, Retreev</strong>
                <p>
                  Building backend and image-indexing systems for an event
                  photo platform; owning architecture, deployment, and
                  production operations.
                </p>
              </div>
            </li>
            <li>
              <span className="entry-key">Oct 2024 – May 2026 →</span>
              <div>
                <strong>Software Engineer, Verboheit Consulting</strong>
                <p>
                  Built backend services for a national mathematics competition,
                  including exams, scoring, staff workflows, and notifications.
                </p>
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
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-heading">
            <h2 id="work-title"># selected projects</h2>
            <span>~/work</span>
          </div>

          <ul className="project-grid">
            {featuredProjects.map((project) => (
              <li key={project.slug}>
                <article className="project-card">
                  <h3>{project.title}</h3>
                  <p className="project-summary">{project.summary}</p>
                  <ul
                    className="project-tags"
                    aria-label={`Technologies used in ${project.title}`}
                  >
                    {project.technologies.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>
                  <div className="project-links">
                    {project.links.map((link) => (
                      <TrackedLink
                        key={link.destination}
                        href={link.href}
                        event={
                          link.external
                            ? 'outbound_link_clicked'
                            : 'content_selected'
                        }
                        properties={
                          link.external
                            ? {
                                destination: link.destination,
                                placement: 'home_project',
                              }
                            : {
                                content_kind: 'article',
                                content_slug: link.destination,
                                source: 'home_project',
                              }
                        }
                        {...(link.external
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                      >
                        {link.label}
                      </TrackedLink>
                    ))}
                  </div>
                </article>
              </li>
            ))}
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
                  <TrackedLink
                    href={item.url}
                    event="content_selected"
                    properties={{
                      content_kind: item.kind,
                      content_slug: item.slug,
                      source: 'home_recent_content',
                    }}
                  >
                    {item.title}
                  </TrackedLink>
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
