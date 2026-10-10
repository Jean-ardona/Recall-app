'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, BookOpen } from 'lucide-react';
import { useQuiz } from '@/context/QuizContext';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';

const CARD_H = 'clamp(370px, 56dvh, 450px)';

export default function QuizPage() {
  const router = useRouter();
  const { quizData, answers, setAnswer } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!quizData) router.replace('/');
  }, [quizData, router]);

  const { questions } = quizData ?? { questions: [] };
  if (!quizData) return null;

  const selectedAnswer = answers[currentIndex] ?? null;
  const isAnswered     = selectedAnswer !== null;
  const isLastQuestion = currentIndex === questions.length - 1;

  function handleAnswer(i: number) { setAnswer(currentIndex, i); }

  function handleNext() {
    if (!isAnswered) return;
    if (isLastQuestion) { router.push('/results'); return; }
    setCurrentIndex(c => c + 1);
  }

  // Keyboard: 1-4 to answer, Enter for Next
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '4') {
      const k = Number(e.key) - 1;
      if (!isAnswered && k < questions[currentIndex].options.length) handleAnswer(k);
    }
    if (e.key === 'Enter' && isAnswered) handleNext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isAnswered, questions]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Stack geometry
  const total      = questions.length;
  const upcomingCards = Math.min(total - currentIndex - 1, 3);  // cards ahead
  const discardCards  = Math.min(currentIndex, 2);               // answered cards

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0 32px',
      background: 'var(--bg)',
    }}>

      {/* Brand + progress */}
      <header style={{ width: 'min(88vw, 400px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 19, color: 'var(--ink)' }}>
          <BookOpen size={20} color="var(--accent)" />
          Recall
        </div>
        <span style={{ fontSize: 13, color: 'var(--mute)', fontVariantNumeric: 'tabular-nums' }}>
          Question {currentIndex + 1} of {total}
        </span>
      </header>

      <ProgressBar current={currentIndex + 1} total={total} />

      {/* Deck */}
      <div
        className="deck-wrap"
        style={{
          height: CARD_H,
          margin: '26px 0 24px 20px',
          position: 'relative',
        }}
      >
        {/* Discard pile (answered) — left side */}
        {Array.from({ length: discardCards }).map((_, i) => {
          const depth = discardCards - i;
          return (
            <div
              key={`discard-${i}`}
              className="deck-card paper card-cover"
              style={{
                zIndex: 10 + i,
                transform: `translate(${-10 * depth - 4}px, ${-9 * depth}px) rotate(${-2.6 * depth}deg) scale(.97)`,
                opacity: depth > 2 ? 0 : 1,
              }}
            />
          );
        })}

        {/* Upcoming cards (face-down stack) */}
        {Array.from({ length: upcomingCards }).map((_, i) => {
          const depth = i + 1;
          return (
            <div
              key={`upcoming-${i}`}
              className="deck-card paper card-cover"
              style={{
                zIndex: 100 - depth,
                transform: `translateY(${depth * 13}px) scale(${1 - depth * 0.04}) rotate(${depth % 2 ? 1.3 : -1.3}deg)`,
                opacity: depth > 3 ? 0 : 1,
              }}
            />
          );
        })}

        {/* Current card */}
        <div className="deck-card" style={{ zIndex: 200 }}>
          <QuestionCard
            key={currentIndex}
            question={questions[currentIndex]}
            selectedAnswer={selectedAnswer}
            onAnswer={handleAnswer}
          />
        </div>
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!isAnswered}
        className="btn-primary"
        style={{ width: 'min(88vw, 400px)', marginTop : "30px"}}
      >
        {isLastQuestion ? 'See results' : 'Next'}
        <ChevronRight size={16} />
      </button>

      {!isAnswered && (
        <p style={{ fontSize: 12.5, color: 'var(--mute)', marginTop: 12 }}>
          Choose an answer to continue. Keys 1–4 also work.
        </p>
      )}
    </main>
  );
}
