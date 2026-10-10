'use client';

import { BookOpen } from 'lucide-react';

/**
 * Loading overlay — pure CSS film-strip animation.
 *
 * A row of pages scrolls continuously left. The strip is wider than the
 * viewport clip, so it looks like pages are always flowing left→right.
 * Left side = unread stack, right side = read stack.
 * No JS, no state, no re-renders — guaranteed smooth.
 */

// One page tile in the strip
function Page({ rotate = 0, opacity = 1 }: { rotate?: number; opacity?: number }) {
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
      opacity,
      // Faint ruled lines to suggest a document page
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

const STRIP_DURATION = '5s'; // one full strip-width scroll

export default function GeneratingOverlay({ count }: { count: number }) {
  return (
    <>
      <style>{`
        @keyframes strip-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes gen-label-pulse {
          0%, 100% { opacity: 1;   }
          50%       { opacity: .4; }
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

        {/* Film strip viewport — clips the scrolling strip */}
        <div style={{
          width: 'min(88vw, 380px)',
          overflow: 'hidden',
          // Fade edges so pages appear/disappear softly
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
          maskImage:        'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
        }}>
          {/*
            The strip is 200% wide (doubled for seamless loop).
            It scrolls left by 50% (= one copy width) then jumps back.
            Each copy has 8 pages with slight rotations for a natural feel.
          */}
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
            {/* Two identical copies for seamless loop */}
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

        {/* Label */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{
            fontSize: 17, fontWeight: 600, color: 'var(--ink)', margin: 0,
            animation: 'gen-label-pulse 2.4s ease-in-out infinite',
          }}>
            Reading your document…
          </p>
          <p style={{ fontSize: 13, color: 'var(--mute)', margin: 0 }}>
            The AI is building {count} questions for you.
          </p>
        </div>
      </div>
    </>
  );
}
