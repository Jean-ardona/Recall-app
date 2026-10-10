'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

function Page({ rotate = 0 }: { rotate?: number }) {
  return (
    <div style={{
      flexShrink: 0,
      width: 80,
      height: 104,
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 9,
      boxShadow: '0 2px 10px rgba(27,35,53,.09), 0 1px 2px rgba(27,35,53,.06)',
      transform: `rotate(${rotate}deg)`,
      backgroundImage: `repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 13px,
        color-mix(in srgb, var(--line) 60%, transparent) 13px,
        color-mix(in srgb, var(--line) 60%, transparent) 14px
      )`,
      backgroundPositionY: '28px',
    }} />
  );
}

const STRIP_DURATION = '5s';

export default function GeneratingOverlay({ count }: { count: number }) {
  const [showHint, setShowHint] = useState(false);

  // After 20 s show the "large documents" hint
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 20000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes strip-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes gen-label-pulse {
          0%, 100% { opacity: 1;  }
          50%       { opacity: .5; }
        }
        @keyframes gen-hint-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gen-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gen-strip { animation: none !important; }
        }
      `}</style>

      <div
        role="status"
        aria-label="Generating your quiz"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 44,
        }}
      >
        {/* Brand */}
        <div style={{
          position: 'absolute', top: 20,
          display: 'flex', alignItems: 'center', gap: 8,
          fontWeight: 700, fontSize: 19, color: 'var(--ink)',
        }}>
          <BookOpen size={20} color="var(--accent)" />
          Recall
        </div>

        {/* Film strip */}
        <div style={{
          width: 'min(88vw, 380px)',
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
          maskImage:        'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
        }}>
          <div
            className="gen-strip"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              width: 'max-content',
              animation: `strip-scroll ${STRIP_DURATION} linear infinite`,
              paddingLeft: 20,
            }}
          >
            {[0, 1].map(copy => (
              <div key={copy} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <Page rotate={-2.5} />
                <Page rotate={-1.0} />
                <Page rotate={ 0.5} />
                <Page rotate={ 1.5} />
                <Page rotate={-1.5} />
                <Page rotate={ 0.0} />
                <Page rotate={ 2.0} />
                <Page rotate={-0.5} />
              </div>
            ))}
          </div>
        </div>

        {/* Labels */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{
            fontSize: 17, fontWeight: 600,
            color: 'var(--ink)',   /* full ink — high contrast */
            margin: 0,
            animation: 'gen-label-pulse 2.4s ease-in-out infinite',
          }}>
            Reading your document…
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--mute)', margin: 0 }}>
            The AI is building {count} questions for you.
          </p>
          {showHint && (
            <p style={{
              fontSize: 12.5,
              color: 'var(--mute)',
              margin: 0,
              animation: 'gen-hint-in .4s ease forwards',
            }}>
              Large documents can take up to a minute.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
