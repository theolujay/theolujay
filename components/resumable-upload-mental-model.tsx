'use client';

import { useEffect, useId, useState } from 'react';

const LAST_STEP = 5;

const messages = [
  'Create an upload resource',
  'Transfer bytes from offset 0',
  'The connection is interrupted',
  'Ask the server for its offset',
  'Resume from the confirmed offset',
  'Upload complete: offset equals length',
];

export function ResumableUploadMentalModel() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const titleId = useId();
  const descriptionId = useId();


  useEffect(() => {
    if (!playing) return;

    const timer = window.setTimeout(() => {
      if (step === LAST_STEP) {
        setPlaying(false);
        return;
      }
      setStep((current) => current + 1);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [playing, step]);

  function togglePlayback() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(LAST_STEP);
      setPlaying(false);
      return;
    }

    if (step === LAST_STEP) setStep(0);
    setPlaying((current) => !current || step === LAST_STEP);
  }

  return (
    <figure className="upload-model">
      <div className="upload-sequence" aria-label="Sequence diagram of a resumable upload">
        <div className="sequence-actors" aria-hidden="true">
          <strong>Client</strong>
          <span />
          <strong>Server</strong>
        </div>
        <ol>
          <li className="to-server">
            <code>POST /uploads</code>
            <span>Upload-Length: N</span>
          </li>
          <li className="to-client">
            <code>201 Created</code>
            <span>Location: /uploads/id</span>
          </li>
          <li className="to-server">
            <code>PATCH /uploads/id</code>
            <span>Upload-Offset: 0<br />Body: first A bytes</span>
          </li>
          <li className="to-client">
            <code>204 No Content</code>
            <span>Upload-Offset: A</span>
          </li>
          <li className="interruption"><span>connection interrupted</span></li>
          <li className="to-server">
            <code>HEAD /uploads/id</code>
            <span>Where should I resume?</span>
          </li>
          <li className="to-client">
            <code>200 OK</code>
            <span>Upload-Offset: A</span>
          </li>
          <li className="to-server">
            <code>PATCH /uploads/id</code>
            <span>Upload-Offset: A<br />Body: remaining bytes</span>
          </li>
          <li className="to-client complete">
            <code>204 No Content</code>
            <span>Upload-Offset: N</span>
          </li>
        </ol>
      </div>

      <div className="upload-motion">
        <div className="motion-heading">
          <div>
            <span className="motion-kicker">interactive model</span>
            <p aria-live="polite">{messages[step]}</p>
          </div>
          <button type="button" onClick={togglePlayback} aria-label={playing ? 'Pause animation' : step === LAST_STEP ? 'Replay animation' : 'Play animation'}>
            {playing ? 'Pause' : step === LAST_STEP ? 'Replay' : 'Play'}
          </button>
        </div>

        <svg viewBox="0 0 700 310" aria-labelledby={`${titleId} ${descriptionId}`}>
          <title id={titleId}>Animated resumable upload</title>
          <desc id={descriptionId}>A file moves from a client to a server, is interrupted, checks the server offset, and resumes from the confirmed byte.</desc>
          <defs>
            <marker id="upload-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0 0 8 4 0 8Z" />
            </marker>
          </defs>

          <g className="endpoint">
            <rect x="25" y="34" width="160" height="226" rx="10" />
            <text x="105" y="67" textAnchor="middle" className="endpoint-title">CLIENT</text>
            <rect x="49" y="91" width="112" height="112" rx="6" className="file" />
            <path d="M121 91v40h40" className="file-fold" />
            <text x="105" y="151" textAnchor="middle" className="file-name">file.bin</text>
            <text x="105" y="180" textAnchor="middle" className="offset-label">cursor: {step < 2 ? '0' : step < 5 ? 'A' : 'N'}</text>
          </g>

          <g className="endpoint">
            <rect x="515" y="34" width="160" height="226" rx="10" />
            <text x="595" y="67" textAnchor="middle" className="endpoint-title">SERVER</text>
            <rect x="539" y="91" width="112" height="112" rx="6" className="storage" />
            <text x="595" y="125" textAnchor="middle" className="file-name">/uploads/id</text>
            <rect x="558" y="148" width="74" height="10" rx="5" className="progress-track" />
            <rect x="558" y="148" width={step < 2 ? 0 : step < 5 ? 38 : 74} height="10" rx="5" className="progress-fill" />
            <text x="595" y="180" textAnchor="middle" className="offset-label">offset: {step < 2 ? '0' : step < 5 ? 'A' : 'N'}</text>
          </g>

          <path d="M205 112H495" className={`motion-line ${step === 0 ? 'active' : ''}`} markerEnd="url(#upload-arrow)" />
          <text x="350" y="101" textAnchor="middle" className={step === 0 ? 'active-label' : ''}>POST → Location</text>

          <path d="M205 160H495" className={`motion-line ${step === 1 || step === 4 ? 'active' : ''}`} markerEnd="url(#upload-arrow)" />
          <text x="350" y="149" textAnchor="middle" className={step === 1 || step === 4 ? 'active-label' : ''}>PATCH + bytes</text>

          <path d="M495 208H205" className={`motion-line reverse ${step === 3 ? 'active' : ''}`} markerEnd="url(#upload-arrow)" />
          <text x="350" y="229" textAnchor="middle" className={step === 3 ? 'active-label' : ''}>HEAD ← Upload-Offset</text>

          {step === 2 ? (
            <g className="disconnect">
              <circle cx="350" cy="160" r="25" />
              <path d="M340 150l20 20m0-20-20 20" />
            </g>
          ) : null}

          {step === LAST_STEP ? <text x="350" y="278" textAnchor="middle" className="success">✓ offset = upload length</text> : null}
        </svg>
      </div>

      <figcaption>
        The server’s offset is authoritative: after a failure, the client asks for the committed position and resumes there.
      </figcaption>
    </figure>
  );
}
