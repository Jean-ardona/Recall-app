'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Question, QuestionCount } from '@/lib/schemas';

interface QuizData {
  questions: Question[];
  extractedText: string;
  questionCount: QuestionCount;
}

interface QuizContextValue {
  quizData: QuizData | null;
  answers: (number | null)[];
  setQuizData: (data: QuizData) => void;
  setAnswer: (index: number, answer: number) => void;
  resetAnswers: () => void;
  clearAll: () => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizData, setQuizDataState] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  function setQuizData(data: QuizData) {
    setQuizDataState(data);
    setAnswers(new Array(data.questions.length).fill(null));
  }

  function setAnswer(index: number, answer: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = answer;
      return next;
    });
  }

  function resetAnswers() {
    if (quizData) {
      setAnswers(new Array(quizData.questions.length).fill(null));
    }
  }

  function clearAll() {
    setQuizDataState(null);
    setAnswers([]);
  }

  return (
    <QuizContext.Provider
      value={{ quizData, answers, setQuizData, setAnswer, resetAnswers, clearAll }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside <QuizProvider>');
  return ctx;
}
