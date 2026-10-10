'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useQuiz } from '@/context/QuizContext';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';

const CARD_H = 'clamp(370px, 56dvh, 450px)';

// Position a card relative to the current index.
// r = cardIndex - currentIndex
// r === 0  → active (centre)
// r  >  0  → upcoming stack (below/behind)
// r  <  0  → discard pile (left)
function cardTransform(r: number): { transform: string; zIndex: number; opacity: number; pointerEvents: 'auto' | 'none' } {
  if (r === 0) {
    return { transform: 'translate(0,0) scale(1) rotate(0deg)', zIndex: 200, opacity: 1, pointerEvents: 'auto' };
  }
  if (r > 0) {
    const n = Math.min(r, 3);
    return {
      transform: `translateY(${n * 13}px) scale(${1 - n * 0.04}) rotate(${n % 2 ? 1.3 : -1.3}deg)`,
      zIndex: 100 - r,
      opacity: r > 3 ? 0 : 1,
      pointerEvents: 'none',
    };
  }
  // r < 0 — discard pile, offset left and rotated
  const d = Math.min(-r, 3);
  return {
    transform: `translate(${-10 * d - 4}px, ${-9 * d}px) rotate(${-2.6 * d}deg) scale(.97)`,
    zIndex: 50 + r,
    opacity: -r > 2 ? 0 : 1,
    pointerEvents: 'auto',
  };
}

export default function QuizPage() {
  const router = useRouter();
  const { quizData, answers, setAnswer } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [justAnsweredIndex, setJustAnsweredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!quizData) router.replace('/');
  }, [quizData, router]);

  if (!quizData) return null;
  const { questions } = quizData;
  const total = questions.length;

  const selectedAnswer = answers[currentIndex] ?? null;
  const isAnswered     = selectedAnswer !== null;
  const isLastQuestion = currentIndex === total - 1;
  const canGoPrev      = currentIndex > 0;
  // Can only go next if current card is answered
  const canGoNext      = isAnswered;

  function handleAnswer(i: number) {
    // Only allow answering the active card, and only once
    if (answers[currentIndex] !== null) return;
    setAnswer(currentIndex, i);
    setJustAnsweredIndex(currentIndex);
  }

  function goNext() {
    if (!canGoNext) return;
    setJustAnsweredIndex(null); // clear lift on navigation
    if (isLastQuestion) { router.push('/results'); return; }
    setCurrentIndex(c => c + 1);
  }

  function goPrev() {
    if (!canGoPrev) return;
    setJustAnsweredIndex(null); // clear lift on navigation
    setCurrentIndex(c => c - 1);
  }

  // Keyboard shortcuts
  const handleKey = useCallback((e: KeyboardEvent) => {
    // Don't intercept if focus is on a button (let space/enter work naturally)
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    if (e.key >= '1' && e.key <= '4') {
      const k = Number(e.key) - 1;
      if (!isAnswered && k < questions[currentIndex].options.length) handleAnswer(k);
    }
    if (e.key === 'Enter' && canGoNext) goNext();
    if (e.key === 'ArrowRight' && canGoNext && !isLastQuestion) goNext();
    if (e.key === 'ArrowLeft'  && canGoPrev) goPrev();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isAnswered, canGoNext, canGoPrev, isLastQuestion, questions]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0 28px',
      background: 'var(--bg)',
    }}>

      {/* Brand */}
      <header style={{ width: 'min(88vw, 400px)', display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 19, color: 'var(--ink)' }}>
          <BookOpen size={20} color="var(--accent)" />
          Recall
        </div>
      </header>

      <ProgressBar current={currentIndex + 1} total={total} />

      {/* Deck — all cards rendered, positioned by CSS transform */}
      <div
        className="deck-wrap"
        style={{
          height: CARD_H,
          margin: '22px 0 20px 20px',
          position: 'relative',
        }}
      >
        {questions.map((question, i) => {
          const r = i - currentIndex;
          // Only render cards in the visible window to keep DOM small
          if (r < -2 || r > 3) return null;
          const { transform, zIndex, opacity, pointerEvents } = cardTransform(r);
          const isDiscard = r < 0;

          return (
            <div
              key={i}
              className="deck-card"
              style={{
                transform,
                zIndex,
                opacity,
                pointerEvents,
                // The CSS transition is on .deck-card in globals.css
              }}
            >
              {isDiscard ? (
                /* Answered cards in discard pile — show full card with locked answer */
                <div
                  onClick={() => setCurrentIndex(i)}
                  style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
                  title="Click to review this answer"
                >
                  <QuestionCard
                    question={question}
                    selectedAnswer={answers[i] ?? null}
                    onAnswer={() => {/* locked */}}
                    justAnswered={false}
                  />
                </div>
              ) : (
                <QuestionCard
                  question={question}
                  selectedAnswer={answers[i] ?? null}
                  onAnswer={handleAnswer}
                  justAnswered={justAnsweredIndex === i}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div style={{
        width: 'min(88vw, 400px)',
        display: 'flex',
        gap: 10,
        marginTop:30
      }}>
        {/* Previous — ghost, only shown after first answer */}
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="btn-ghost"
          style={{
            width: 48,
            flexShrink: 0,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canGoPrev ? 1 : 0,
            pointerEvents: canGoPrev ? 'auto' : 'none',
            transition: 'opacity .2s',
          }}
          aria-label="Previous question"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Next / See results — primary */}
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="btn-primary"
          style={{ flex: 1 }}
        >
          {isLastQuestion ? 'See results' : 'Next'}
          <ChevronRight size={16} />
        </button>
      </div>

      {!isAnswered && (
        <p style={{ fontSize: 12.5, color: 'var(--mute)', marginTop: 10 }}>
          Choose an answer to continue. Keys 1–4 also work.
        </p>
      )}
    </main>
  );
}
