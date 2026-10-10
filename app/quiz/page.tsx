'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useQuiz } from '@/context/QuizContext';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';

export default function QuizPage() {
  const router = useRouter();
  const { quizData, answers, setAnswer } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!quizData) {
      router.replace('/');
    }
  }, [quizData, router]);

  if (!quizData) return null;

  const { questions } = quizData;
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentIndex] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const showNextButton = selectedAnswer !== null;

  function handleAnswer(answerIndex: number) {
    setAnswer(currentIndex, answerIndex);
  }

  function handleNext() {
    if (isLastQuestion) {
      router.push('/results');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <ProgressBar current={currentIndex + 1} total={questions.length} />

        <QuestionCard
          key={currentIndex}
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
        />

        {showNextButton && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-6 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              {isLastQuestion ? 'See results' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
