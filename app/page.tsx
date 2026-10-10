'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useQuiz } from '@/context/QuizContext';
import QuestionCountSelector from '@/components/QuestionCountSelector';
import { countWords, getDefaultCount, type QuestionCount } from '@/lib/schemas';
import type { Question } from '@/lib/schemas';

export default function HomePage() {
  const router = useRouter();
  const { setQuizData } = useQuiz();

  const [text, setText] = useState('');
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = countWords(text);

  // Keep question count in sync with word count gating
  useEffect(() => {
    const defaultCount = getDefaultCount(wordCount);
    if (defaultCount && defaultCount < questionCount) {
      setQuestionCount(defaultCount);
    } else if (defaultCount && questionCount < 5) {
      setQuestionCount(defaultCount);
    }
  }, [wordCount, questionCount]);

  const canGenerate = wordCount >= 150 && !generating;

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, count: questionCount }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setQuizData({
        questions: data.questions as Question[],
        extractedText: text,
        questionCount,
      });

      router.push('/quiz');
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#111] tracking-tight">Recall</h1>
          <p className="text-[#666] text-base">
            Paste your study notes and get a multiple-choice quiz in seconds.
          </p>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <label htmlFor="notes" className="text-sm font-medium text-[#555]">
            Your notes
          </label>
          <textarea
            id="notes"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your study notes here — at least 150 words to generate a quiz."
            rows={10}
            className="w-full rounded-xl border border-[#DDD] bg-white px-4 py-3 text-sm text-[#111] placeholder-[#AAA] resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
          />
          <p className="text-xs text-[#AAA] text-right">{wordCount} words</p>
        </div>

        {/* Question count selector */}
        <QuestionCountSelector
          wordCount={wordCount}
          selected={questionCount}
          onChange={setQuestionCount}
          disabled={generating}
        />

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold transition-colors hover:bg-slate-700 disabled:bg-[#CCC] disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating quiz...
            </>
          ) : (
            'Generate quiz'
          )}
        </button>

        {!canGenerate && !generating && wordCount > 0 && wordCount < 150 && (
          <p className="text-xs text-[#AAA] text-center -mt-4">
            Add {150 - wordCount} more words to enable generation.
          </p>
        )}
      </div>
    </main>
  );
}
