'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, RefreshCw, Home, BookOpen, ChevronLeft, ListChecks, Check } from 'lucide-react';
import { useQuiz } from '@/context/QuizContext';
import ScoreDisplay from '@/components/ScoreDisplay';
import MistakeReview from '@/components/MistakeReview';
import type { Question } from '@/lib/schemas';

export default function ResultsPage() {
  const router = useRouter();
  const { quizData, answers, resetAnswers, setQuizData, clearAll } = useQuiz();
  const [view, setView] = useState<'summary' | 'review'>('summary');

  useEffect(() => {
    if (!quizData) router.replace('/');
  }, [quizData, router]);

  if (!quizData) return null;

  const { questions, extractedText, questionCount } = quizData;
  const answeredAll = answers.every((a) => a !== null);

  if (!answeredAll) {
    router.replace('/quiz');
    return null;
  }

  const mistakes = questions
    .map((q: Question, i: number) => ({ question: q, userAnswerIndex: answers[i] as number }))
    .filter(item => item.userAnswerIndex !== item.question.correctIndex);

  const correctCount = questions.length - mistakes.length;
  const hasMistakes  = mistakes.length > 0;

  async function handleNewQuiz() {
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText, count: questionCount }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error ?? 'Could not generate a new quiz. Please try again.');
        return;
      }
      setQuizData({ questions: data.questions, extractedText, questionCount });
      router.push('/quiz');
    } catch {
      alert('Could not reach the server. Please try again.');
    }
  }

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 0 24px',
      background: 'var(--bg)',
    }}>
      {/* Brand */}
      <header style={{ width: 'min(88vw, 400px)', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 19, color: 'var(--ink)' }}>
          <BookOpen size={20} color="var(--accent)" />
          Recall
        </div>
      </header>

      <div style={{ width: 'min(88vw, 400px)', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ── SUMMARY STATE ─────────────────────────────────── */}
        <div style={{
          display: view === 'summary' ? 'flex' : 'none',
          flexDirection: 'column',
          flex: 1,
          gap: 16,
          /* smooth fade-in when returning from review */
          opacity: view === 'summary' ? 1 : 0,
          transition: 'opacity .25s ease',
        }}>
          <ScoreDisplay correct={correctCount} total={questions.length} />

          {/* Perfect score message or review button */}
          {!hasMistakes ? (
            <div
              className="flex items-center gap-2"
              style={{
                background: 'var(--okbg)',
                border: '1px solid var(--ok)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13.5,
                color: 'var(--ok)',
              }}
            >
              <Check size={15} strokeWidth={2.5} />
              Every answer was correct. Nothing to review.
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setView('review')}
              className="btn-ghost"
              style={{ justifyContent: 'center' }}
            >
              <ListChecks size={15} />
              Review mistakes ({mistakes.length})
            </button>
          )}

          {/* Primary action */}
          <button
            type="button"
            onClick={() => { resetAnswers(); router.push('/quiz'); }}
            className="btn-primary"
          >
            <RotateCcw size={15} />
            Retake quiz
          </button>

          {/* Secondary quiet actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              type="button"
              onClick={handleNewQuiz}
              style={{
                background: 'none', border: 'none',
                fontSize: 13.5, color: 'var(--mute)',
                cursor: 'pointer', padding: '6px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}
            >
              <RefreshCw size={13} />
              New quiz from this document
            </button>
            <button
              type="button"
              onClick={() => { clearAll(); router.push('/'); }}
              style={{
                background: 'none', border: 'none',
                fontSize: 13.5, color: 'var(--mute)',
                cursor: 'pointer', padding: '6px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}
            >
              <Home size={13} />
              Start over
            </button>
          </div>
        </div>

        {/* ── REVIEW STATE ──────────────────────────────────── */}
        <div style={{
          display: view === 'review' ? 'flex' : 'none',
          flexDirection: 'column',
          flex: 1,
          gap: 12,
          opacity: view === 'review' ? 1 : 0,
          transition: 'opacity .25s ease',
        }}>
          {/* Back button */}
          <button
            type="button"
            onClick={() => setView('summary')}
            style={{
              background: 'none', border: 'none',
              fontSize: 13.5, color: 'var(--mute)',
              cursor: 'pointer', padding: '4px 0',
              display: 'flex', alignItems: 'center', gap: 5,
              alignSelf: 'flex-start',
            }}
          >
            <ChevronLeft size={15} />
            Back to results
          </button>

          {/* Carousel fills remaining space */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <MistakeReview mistakes={mistakes} />
          </div>
        </div>

      </div>
    </main>
  );
}
