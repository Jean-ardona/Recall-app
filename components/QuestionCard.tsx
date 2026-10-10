'use client';

import { Check, X } from 'lucide-react';
import type { Question } from '@/lib/schemas';

interface Props {
  question: Question;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
}

export default function QuestionCard({ question, selectedAnswer, onAnswer }: Props) {
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === question.correctIndex;

  return (
    <div
      className={`flip-scene${isAnswered && isCorrect ? ' card-lift' : ''}`}
      style={{ height: 'clamp(370px, 56dvh, 450px)' }}
    >
      <div className={`flip-inner${isAnswered ? ' flipped' : ''}`}>

        {/* ── FRONT ── */}
        <div className="flip-face paper" style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column' }}>
          <p
            className="font-semibold leading-snug"
            style={{ fontSize: 19, color: 'var(--ink)', margin: '0 0 20px', letterSpacing: '-.01em' }}
          >
            {question.question}
          </p>

          <div className="flex flex-col" style={{ gap: 9, marginTop: 'auto' }}>
            {question.options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => !isAnswered && onAnswer(i)}
                disabled={isAnswered}
                aria-label={`Option ${i + 1}: ${option}`}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 14.5,
                  textAlign: 'left',
                  color: 'var(--ink)',
                  background: selectedAnswer === i ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                  border: `1px solid ${selectedAnswer === i ? 'var(--accent)' : 'var(--line)'}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  cursor: isAnswered ? 'default' : 'pointer',
                  transition: 'border-color .2s, background .2s',
                }}
                className="focus-visible:outline-[2px] focus-visible:outline-[var(--accent)]"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className={`flip-face flip-back paper`}
          style={{
            padding: '24px 22px',
            display: 'flex',
            flexDirection: 'column',
            background: isCorrect ? 'var(--okbg)' : 'var(--badbg)',
          }}
        >
          {/* Verdict */}
          <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
            <span
              style={{
                width: 30, height: 30, borderRadius: '50%',
                display: 'grid', placeItems: 'center',
                background: isCorrect ? 'var(--okbg)' : 'var(--badbg)',
                color: isCorrect ? 'var(--ok)' : 'var(--bad)',
                border: `1px solid ${isCorrect ? 'var(--ok)' : 'var(--bad)'}`,
                flexShrink: 0,
              }}
            >
              {isCorrect
                ? <Check size={15} strokeWidth={2.6} />
                : <X size={15} strokeWidth={2.6} />}
            </span>
            <span
              className="font-semibold"
              style={{ fontSize: 16, color: isCorrect ? 'var(--ok)' : 'var(--bad)' }}
            >
              {isCorrect ? 'Correct' : 'Not quite'}
            </span>
          </div>

          {/* Your answer / Correct answer */}
          {!isCorrect && isAnswered && (
            <p className="flex gap-2" style={{ fontSize: 13.5, lineHeight: 1.4, margin: '0 0 6px', color: 'var(--ink)' }}>
              <X size={14} style={{ color: 'var(--bad)', flexShrink: 0, marginTop: 2 }} />
              <span><strong style={{ color: 'var(--bad)' }}>Your answer:</strong> {question.options[selectedAnswer!]}</span>
            </p>
          )}
          <p className="flex gap-2" style={{ fontSize: 13.5, lineHeight: 1.4, margin: '0 0 10px', color: 'var(--ink)' }}>
            <Check size={14} style={{ color: 'var(--ok)', flexShrink: 0, marginTop: 2 }} />
            <span><strong style={{ color: 'var(--ok)' }}>Correct answer:</strong> {question.options[question.correctIndex]}</span>
          </p>

          {/* Explanation */}
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: '0 0 12px', color: 'var(--ink)' }}>
            {question.explanation}
          </p>

          {/* Source excerpt */}
          <blockquote
            style={{
              fontSize: 13, lineHeight: 1.5, color: 'var(--mute)',
              fontStyle: 'italic',
              borderLeft: '2px solid var(--line)',
              padding: '2px 0 2px 12px',
              margin: 'auto 0 0',
            }}
          >
            {question.excerpt}
          </blockquote>
        </div>

      </div>
    </div>
  );
}
