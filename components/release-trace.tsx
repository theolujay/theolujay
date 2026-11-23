'use client';

import { useState, type CSSProperties } from 'react';
import styles from './release-trace.module.css';

export function ReleaseTrace() {
  const [failed, setFailed] = useState(false);
  const lanes = [
    {
      label: 'Before',
      title: 'Tag to deploy',
      steps: [
        'Push v1.1.1',
        ...(failed
          ? ['Checks fail', 'Fix and delete tag', 'Push v1.1.1 again']
          : ['Checks pass', 'Deploy to production']),
      ],
    },
    {
      label: 'After',
      title: 'Deploy to tag',
      steps: [
        'Push v1.1.1-rc1',
        ...(failed
          ? ['Checks fail', 'Fix and push rc2', 'No stable tag yet']
          : [
              'Checks pass',
              'Stage and promote',
              'Deploy to production',
              'Tag v1.1.1',
            ]),
      ],
    },
  ];
  return (
    <figure className={styles.trace}>
      <figcaption>
        Release trace <span>/ gateway</span>
      </figcaption>
      <div
        className={styles.controls}
        role="group"
        aria-label="Integration check outcome"
      >
        {['Checks pass', 'Checks fail'].map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={failed === Boolean(i)}
            onClick={() => setFailed(Boolean(i))}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.lanes} key={String(failed)}>
        {lanes.map(({ label, title, steps }) => (
          <section key={label} aria-label={`${label}: ${title}`}>
            <small>{label}</small>
            <strong>{title}</strong>
            <ol>
              {steps.map((step, i) => (
                <li key={step} style={{ '--step': i } as CSSProperties}>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </figure>
  );
}
