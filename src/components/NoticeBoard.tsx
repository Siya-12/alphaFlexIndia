'use client';

import { useEffect, useRef, useState } from 'react';

interface OfficeInfo {
  eyebrow: string;
  pinColor: string;
  lines: string[];
  hoursLabel: string;
  hours: string;
  closed: string;
}

interface PhoneEntry {
  number: string;
  name: string;
}

interface ContactInfo {
  eyebrow: string;
  pinColor: string;
  phones: PhoneEntry[];
  emails: string[];
}

interface BrandInfo {
  name: string;
  tagline: string;
}

const office: OfficeInfo = {
  eyebrow: 'Registered Office',
  pinColor: '#ff5470',
  lines: ['H-1422, DSIDC Industrial Complex,', 'Narela Industrial Area,', 'Delhi – 110040, India'],
  hoursLabel: 'Working Hours',
  hours: 'Mon – Sat  9:00 AM – 6:00 PM',
  closed: 'Sunday closed',
};

const contact: ContactInfo = {
  eyebrow: 'Get in touch with us',
  pinColor: '#ffb020',
  phones: [
    { number: '+91 98116 55229', name: 'Chirag Goyal — CEO' },
    { number: '+91 72890 09229', name: 'Vishard Bansal — Manager' },
  ],
  emails: ['info@alphaflexindia.com', 'alphaflexindia@gmail.com'],
};

const brand: BrandInfo = {
  name: 'ALPHA FLEX INDIA',
  tagline: 'Shaping the future of packaging',
};

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
}

interface PinProps {
  color: string;
  delay: number;
}

function Pin({ color, delay }: PinProps) {
  return (
    <span
      className="pin"
      style={{ '--pin-color': color, '--pin-delay': `${delay}ms` } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="pin-string" />
      <span className="pin-head" />
    </span>
  );
}

interface LogoProps {
  src?: string;
  alt: string;
}

function Logo({ src, alt }: LogoProps) {
  const [errored, setErrored] = useState(false);
  return (
    <div className="logo-slot">
      {src && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
  src={src}
  alt={alt}
  width={180}
  height={60}
  className="logo-img"
  onError={() => setErrored(true)}
/>
      ) : (
        <span className="logo-placeholder">Logo</span>
      )}
    </div>
  );
}

export interface NoticeBoardProps {
  logoSrc?: string;
}

export default function NoticeBoard({ logoSrc = '/images/Alpha.png' }: NoticeBoardProps) {
  const [ref, inView] = useInView<HTMLElement>();

  return (
    <section ref={ref} className={`board-section ${inView ? 'is-in-view' : ''}`}>
      <div className="board-grid" aria-hidden="true" />
      <div className="board-glow" aria-hidden="true" />

      <div className="board-wrap">
        <div className="board-header">
          <h2 className="board-title">Everything you need to reach us</h2>
        </div>

        <div className="board-cards">
          {/* CARD 1 — OFFICE */}
          <article className="note-card note-card--office">
            <Pin color={office.pinColor} delay={0} />
            <header className="note-head">
              <Logo src={logoSrc} alt={`${brand.name} logo`} />
            </header>

            <div className="note-divider" />

            <div className="note-row">
              <span className="note-icon">📍</span>
              <div>
                <p className="note-label">{office.eyebrow}</p>
                {office.lines.map((line, i) => (
                  <p key={i} className="note-text">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="note-row">
              <span className="note-icon">🕒</span>
              <div>
                <p className="note-label">{office.hoursLabel}</p>
                <p className="note-text note-text--strong">{office.hours}</p>
                <p className="note-text note-text--muted">{office.closed}</p>
              </div>
            </div>
          </article>

          {/* CARD 2 — CONTACT */}
          <article className="note-card note-card--contact">
            <Pin color={contact.pinColor} delay={180} />
            <header className="note-head">
              <Logo src={logoSrc} alt={`${brand.name} logo`} />
            </header>

            <div className="note-divider" />

            <div className="note-row">
              <span className="note-icon note-icon--phone">📞</span>
              <div>
                <p className="note-label">Phone</p>
                {contact.phones.map((p, i) => (
                  <p key={i} className="note-text">
                    <span className="note-text--strong">{p.number}</span>
                    <br />
                    <span className="note-text--muted">{p.name}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="note-row">
              <span className="note-icon note-icon--mail">✉️</span>
              <div>
                <p className="note-label">Email</p>
                {contact.emails.map((e, i) => (
                  <a key={i} href={`mailto:${e}`} className="note-link">
                    {e}
                  </a>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>

      <style jsx>{`
        .board-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: clamp(3.5rem, 8vw, 6rem) 1.25rem;
          background: #ffffff;
          isolation: isolate;
        }

        .board-grid {
          position: absolute;
          inset: 0;
          // background-image: linear-gradient(rgba(59, 99, 224, 0.07) 1px, transparent 1px),
            // linear-gradient(90deg, rgba(59, 99, 224, 0.07) 1px, transparent 1px);
          background-size: 42px 42px;
          animation: gridDrift 18s linear infinite;
          z-index: 0;
        }

        .board-glow {
          position: absolute;
          top: -10%;
          left: 50%;
          width: min(900px, 90%);
          height: 420px;
          background: radial-gradient(ellipse, rgba(97, 140, 255, 0.16), transparent 70%);
          transform: translateX(-50%);
          z-index: 0;
          animation: glowPulse 6s ease-in-out infinite;
        }

        @keyframes gridDrift {
          0% {
            background-position: 0 0, 0 0;
          }
          100% {
            background-position: 42px 42px, 42px 42px;
          }
        }

        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.6;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.06);
          }
        }

        .board-wrap {
          position: relative;
          z-index: 1;
          max-width: 1180px;
          margin: 0 auto;
        }

        .board-header {
          text-align: center;
          margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .is-in-view .board-header {
          opacity: 1;
          transform: translateY(0);
        }


        .board-title {
          font-size: clamp(1.6rem, 3.4vw, 2.5rem);
          font-weight: 800;
          color: #16203f;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .board-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem);
          justify-items: center;
          align-items: start;
        }

        @media (max-width: 760px) {
          .board-cards {
            grid-template-columns: 1fr;
          }
        }

        .note-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          // background: radial-gradient(circle at 1px 1px, rgba(59, 99, 224, 0.16) 1px, transparent 1.6px) 0 0 / 18px 18px,
            // linear-gradient(160deg, #eef2ff 0%, #f8faff 55%, #eef2ff 100%);
          border: 1px solid rgba(59, 99, 224, 0.12);
          border-radius: 14px;
          padding: clamp(1.6rem, 3vw, 2.2rem) clamp(1.5rem, 3vw, 2rem) 2rem;
          box-shadow: 0 18px 40px rgba(43, 74, 168, 0.14), 0 2px 0 rgba(255, 255, 255, 0.8) inset;
          opacity: 0;
          transform: translateY(46px) scale(0.94) rotate(var(--rest-rot, -2deg));
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: var(--card-delay, 0ms);
          animation: cardFloat 6s ease-in-out infinite;
          animation-play-state: paused;
        }

        .note-card--office {
          --rest-rot: -2.2deg;
          --card-delay: 60ms;
          animation-delay: 0.2s;
        }

        .note-card--contact {
          --rest-rot: 2deg;
          --card-delay: 260ms;
          animation-delay: 0.9s;
        }

        .is-in-view .note-card {
          opacity: 1;
          transform: translateY(0) scale(1) rotate(var(--rest-rot, 0deg));
          animation-play-state: running;
        }

        .note-card:hover {
          transform: translateY(-6px) scale(1.015) rotate(0deg) !important;
          box-shadow: 0 26px 55px rgba(43, 74, 168, 0.22), 0 2px 0 rgba(255, 255, 255, 0.8) inset;
          animation-play-state: paused;
        }

        @keyframes cardFloat {
          0%,
          100% {
            transform: translateY(0) scale(1) rotate(var(--rest-rot, 0deg));
          }
          50% {
            transform: translateY(-7px) scale(1) rotate(var(--rest-rot, 0deg));
          }
        }

        .pin {
          position: absolute;
          top: -34px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 34px;
          display: flex;
          justify-content: center;
          opacity: 0;
          animation: pinDrop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: var(--pin-delay, 0ms);
        }

        .is-in-view .pin {
          opacity: 1;
        }

        .pin-string {
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, rgba(59, 99, 224, 0.12), rgba(59, 99, 224, 0));
        }

        .pin-head {
          position: absolute;
          top: -8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle at 32% 30%, #fff, var(--pin-color) 55%, rgba(0, 0, 0, 0.25));
          box-shadow: 0 6px 10px rgba(43, 74, 168, 0.35), 0 0 0 2px rgba(255, 255, 255, 0.6);
          animation: pinPulse 2.6s ease-in-out infinite;
        }

        .pin-head::after {
          content: '';
          position: absolute;
          top: 26px;
          left: 50%;
          width: 26px;
          height: 8px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(43, 74, 168, 0.22), transparent 70%);
          border-radius: 50%;
        }

        @keyframes pinDrop {
          0% {
            opacity: 0;
            transform: translateY(-24px) scale(0.4);
          }
          70% {
            opacity: 1;
            transform: translateY(4px) scale(1.08);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pinPulse {
          0%,
          100% {
            box-shadow: 0 6px 10px rgba(43, 74, 168, 0.35), 0 0 0 2px rgba(255, 255, 255, 0.6);
          }
          50% {
            box-shadow: 0 6px 16px rgba(43, 74, 168, 0.35), 0 0 0 6px rgba(255, 255, 255, 0.4);
          }
        }

        .note-head {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          margin-bottom: 0.9rem;
        }

 .logo-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 70px;   /* reduce this if needed */
  overflow: hidden;
}

.logo-img {
  width: 180px; !important
  max-width: 100%; 
  height: auto; !important
}
        .logo-placeholder {
          font-size: 0.65rem;
          font-weight: 600;
          color: #9297ab;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .brand-name {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.01em;
          color: #17203f;
          margin: 0 0 2px;
        }

        .brand-tag {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #ff5470;
          margin: 0;
        }

        .brand-tag--alt {
          color: #ffb020;
        }

        .note-divider {
          border-top: 1px dashed #c3cdf2;
          margin: 0.9rem 0 1.1rem;
        }

        .note-row {
          display: flex;
          gap: 0.85rem;
          margin-bottom: 1.1rem;
        }

        .note-row:last-child {
          margin-bottom: 0;
        }

        .note-icon {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #ffe3e6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .note-icon--phone {
          background: #d9f2e3;
        }

        .note-icon--mail {
          background: #dbe6ff;
        }

        .note-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6c76a8;
          margin: 0 0 0.3rem;
        }

        .note-text {
          font-size: 0.92rem;
          color: #2a3050;
          margin: 0 0 0.15rem;
          line-height: 1.4;
        }

        .note-text--strong {
          font-weight: 700;
          color: #171d38;
        }

        .note-text--muted {
          color: #8b90a3;
          font-size: 0.82rem;
        }

        .note-link {
          display: block;
          font-size: 0.92rem;
          color: #3b63e0;
          text-decoration: none;
          margin-bottom: 0.15rem;
          transition: color 0.2s ease;
        }

        .note-link:hover {
          color: #1d3fbf;
          text-decoration: underline;
        }

        @media (prefers-reduced-motion: reduce) {
          .board-grid,
          .board-glow,
          .note-card,
          .pin,
          .pin-head {
            animation: none !important;
          }
          .note-card,
          .board-header,
          .pin {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
