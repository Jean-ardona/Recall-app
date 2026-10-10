'use client';

import { useEffect, useRef } from 'react';

interface Props {
  correct: number;
  total: number;
}

const CIRCUMFERENCE = 339.3; // 2π × 54

function getMessage(pct: number): string {
  if (pct === 100) return 'Everything stuck. You\'re ready.';
  if (pct >= 70)  return 'Solid. A few points to tighten.';
  if (pct >= 50)  return 'Decent foundation. Worth revisiting the sections below.';
  return 'Some gaps worth addressing before the exam.';
}

export default function ScoreDisplay({ correct, total }: Props) {
  const arcRef  = useRef<SVGCircleElement>(null);
  const numRef  = useRef<HTMLSpanElement>(null);
  const pctRef  = useRef<HTMLSpanElement>(null);
  const finalPct = Math.round((correct / total) * 100);

  useEffect(() => {
    const arc = arcRef.current;
    const num = numRef.current;
    const pct = pctRef.current;
    if (!arc || !num || !pct) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = reduced ? 1 : 1400;
    const t0 = performance.now();

    function step(t: number) {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      arc!.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - e * correct / total));
      const shown = Math.round(e * correct);
      num!.textContent = `${shown}/${total}`;
      pct!.textContent = `${Math.round(e * finalPct)}%`;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [correct, total, finalPct]);

  return (
    <div className="flex flex-col items-center gap-4" style={{ paddingTop: 8 }}>
      {/* Ring */}
      <div className="score-ring" style={{ position: 'relative', width: 132, height: 132 }}>
        <svg width="132" height="132" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="66" cy="66" r="54" fill="none" stroke="var(--line)" strokeWidth="8" />
          <circle
            ref={arcRef}
            className="progress"
            cx="66" cy="66" r="54"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', placeContent: 'center',
          textAlign: 'center',
        }}>
          <span
            ref={numRef}
            style={{ fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}
          >
            0/{total}
          </span>
          <span
            ref={pctRef}
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--mute)' }}
          >
            0%
          </span>
        </div>
      </div>

      <p style={{ fontSize: 14.5, color: 'var(--mute)', textAlign: 'center', margin: 0 }}>
        {getMessage(finalPct)}
      </p>
    </div>
  );
}
