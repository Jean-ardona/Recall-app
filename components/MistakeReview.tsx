'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import type { Question } from '@/lib/schemas';

interface MistakeItem {
  question: Question;
  userAnswerIndex: number;
}

interface Props {
  mistakes: MistakeItem[];
}

export default function MistakeReview({ mistakes }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);

  // Single "all correct" card
  const cards = mistakes.length === 0
    ? [null] // null = perfect score card
    : mistakes;

  const total = cards.length;

  function scrollTo(i: number) {
    const rail = railRef.current;
    if (!rail) return;
    const itemW = rail.clientWidth + 14;
    rail.scrollTo({ left: itemW * i, behavior: 'smooth' });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    function onScroll() {
      const itemW = rail!.clientWidth + 14;
      setPos(Math.round(rail!.scrollLeft / itemW));
    }
    rail.addEventListener('scroll', onScroll, { passive: true });
    return () => rail.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
          Review your mistakes
        </h2>
        {total > 1 && (
          <div className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--mute)', fontVariantNumeric: 'tabular-nums' }}>
            <button
              aria-label="Previous mistake"
              disabled={pos <= 0}
              onClick={() => scrollTo(pos - 1)}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                border: '1px solid var(--line)', background: 'transparent',
                color: 'var(--ink)', display: 'grid', placeItems: 'center',
                cursor: pos <= 0 ? 'not-allowed' : 'pointer',
                opacity: pos <= 0 ? .3 : 1,
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <span>{pos + 1} / {total}</span>
            <button
              aria-label="Next mistake"
              disabled={pos >= total - 1}
              onClick={() => scrollTo(pos + 1)}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                border: '1px solid var(--line)', background: 'transparent',
                color: 'var(--ink)', display: 'grid', placeItems: 'center',
                cursor: pos >= total - 1 ? 'not-allowed' : 'pointer',
                opacity: pos >= total - 1 ? .3 : 1,
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div
        ref={railRef}
        className="snap-rail"
        style={{ paddingBottom: 20 }}
      >
        {cards.map((item, i) => (
          <div
            key={i}
            className="snap-item paper"
            style={{
              
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              overflowY: 'auto',
            }}
          >
            {item === null ? (
              /* Perfect score card */
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <span style={{
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'grid', placeItems: 'center',
                  background: 'var(--okbg)', color: 'var(--ok)',
                }}>
                  <Check size={22} strokeWidth={2.5} />
                </span>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', textAlign: 'center', margin: 0 }}>
                  No mistakes to review.
                </p>
                <p style={{ fontSize: 13.5, color: 'var(--mute)', textAlign: 'center', margin: 0 }}>
                  Every answer was correct.
                </p>
              </div>
            ) : (
              /* Mistake card */
              <>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: 0, lineHeight: 1.35 }}>
                  {item.question.question}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13.5 }}>
                  <div className="flex items-start gap-2">
                    <X size={13} style={{ color: 'var(--bad)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--ink)' }}>
                      <strong style={{ color: 'var(--bad)' }}>Your answer:</strong>{' '}
                      {item.question.options[item.userAnswerIndex]}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={13} style={{ color: 'var(--ok)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--ink)' }}>
                      <strong style={{ color: 'var(--ok)' }}>Correct answer:</strong>{' '}
                      {item.question.options[item.question.correctIndex]}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink)', margin: 0 }}>
                  {item.question.explanation}
                </p>

                <blockquote style={{
                  fontSize: 13, lineHeight: 1.5, color: 'var(--mute)',
                  fontStyle: 'italic',
                  borderLeft: '2px solid var(--line)',
                  paddingLeft: 10,
                  margin: 'auto 0 0',
                }}>
                  {item.question.excerpt}
                </blockquote>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
