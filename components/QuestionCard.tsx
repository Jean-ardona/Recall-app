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

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-[#E8E8E8] rounded-xl p-8 shadow-sm">
      <p className="text-lg font-semibold text-[#111] mb-6 leading-snug">
        {question.question}
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isChosen = selectedAnswer === i;
          const isFaded = isAnswered && !isCorrect && !isChosen;

          let stateClasses = 'border-[#DDD] bg-white hover:border-slate-400 cursor-pointer';
          if (isAnswered) {
            if (isCorrect) {
              stateClasses = 'border-green-500 bg-green-50 cursor-default';
            } else if (isChosen) {
              stateClasses = 'border-red-500 bg-red-50 cursor-default';
            } else {
              stateClasses = 'border-[#E8E8E8] bg-white opacity-40 cursor-default';
            }
          }

          return (
            <button
              key={i}
              type="button"
              disabled={isAnswered}
              onClick={() => !isAnswered && onAnswer(i)}
              className={`
                flex items-center justify-between w-full px-4 py-3 rounded-lg border text-left
                transition-colors text-sm font-medium
                ${stateClasses}
                ${isFaded ? 'opacity-40' : ''}
              `}
            >
              <span className="text-[#111]">{option}</span>
              {isAnswered && isCorrect && (
                <Check size={16} className="text-green-600 flex-shrink-0 ml-2" />
              )}
              {isAnswered && isChosen && !isCorrect && (
                <X size={16} className="text-red-600 flex-shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="border-t border-[#F0F0F0] pt-5 space-y-3">
          <p className="text-sm text-[#333] leading-relaxed">
            <span className="font-semibold">Explanation: </span>
            {question.explanation}
          </p>
          <blockquote className="border-l-2 border-slate-300 pl-3 text-sm text-[#666] italic leading-relaxed">
            {question.excerpt}
          </blockquote>
        </div>
      )}
    </div>
  );
}
