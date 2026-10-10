'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, RefreshCw, Home, BookOpen } from 'lucide-react';
import { useQuiz } from '@/context/QuizContext';
import ScoreDisplay from '@/components/ScoreDisplay';
import MistakeReview from '@/components/MistakeReview';
import type { Question } from '@/lib/schemas';

export default function ResultsPage() {
  const router = useRouter();
  const { quizData, answers, resetAnswers, setQuizData, clearAll } = useQuiz();

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
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0 40px',
      background: 'var(--bg)',
    }}>
      {/* Brand */}
      <header style={{ width: 'min(88vw, 400px)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 19, color: 'var(--ink)' }}>
          <BookOpen size={20} color="var(--accent)" />
          Recall
        </div>
      </header>

      <div style={{ width: 'min(88vw, 400px)', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Score ring */}
        <ScoreDisplay correct={correctCount} total={questions.length} />

        {/* Mistakes carousel */}
        <MistakeReview mistakes={mistakes} />

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => { resetAnswers(); router.push('/quiz'); }}
            className="btn-ghost"
          >
            <RotateCcw size={15} />
            Retake quiz
          </button>
          <button
            type="button"
            onClick={handleNewQuiz}
            className="btn-ghost"
          >
            <RefreshCw size={15} />
            New quiz from this document
          </button>
          <button
            type="button"
            onClick={() => { clearAll(); router.push('/'); }}
            className="btn-primary"
          >
            <Home size={15} />
            Start over
          </button>
        </div>

      </div>
    </main>
  );
}
