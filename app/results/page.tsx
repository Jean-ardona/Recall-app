'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, RefreshCw, Home } from 'lucide-react';
import { useQuiz } from '@/context/QuizContext';
import ScoreDisplay from '@/components/ScoreDisplay';
import MistakeReview from '@/components/MistakeReview';
import type { Question } from '@/lib/schemas';

export default function ResultsPage() {
  const router = useRouter();
  const { quizData, answers, resetAnswers, setQuizData, clearAll } = useQuiz();

  useEffect(() => {
    if (!quizData) {
      router.replace('/');
    }
  }, [quizData, router]);

  if (!quizData) return null;

  const { questions, extractedText, questionCount } = quizData;
  const answeredAll = answers.every((a) => a !== null);

  if (!answeredAll) {
    router.replace('/quiz');
    return null;
  }

  const correctCount = questions.filter(
    (q: Question, i: number) => answers[i] === q.correctIndex
  ).length;

  const mistakes = questions
    .map((q: Question, i: number) => ({
      question: q,
      userAnswerIndex: answers[i] as number,
    }))
    .filter((item) => item.userAnswerIndex !== item.question.correctIndex);

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
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <ScoreDisplay correct={correctCount} total={questions.length} />

        <MistakeReview mistakes={mistakes} />

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            type="button"
            onClick={() => { resetAnswers(); router.push('/quiz'); }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#DDD] bg-white text-sm font-medium text-[#111] hover:border-slate-400 transition-colors"
          >
            <RotateCcw size={15} />
            Retake quiz
          </button>
          <button
            type="button"
            onClick={handleNewQuiz}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#DDD] bg-white text-sm font-medium text-[#111] hover:border-slate-400 transition-colors"
          >
            <RefreshCw size={15} />
            New quiz from this document
          </button>
          <button
            type="button"
            onClick={() => { clearAll(); router.push('/'); }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            <Home size={15} />
            Start over
          </button>
        </div>
      </div>
    </main>
  );
}
