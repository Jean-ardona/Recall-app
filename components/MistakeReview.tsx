import type { Question } from '@/lib/schemas';

interface MistakeItem {
  question: Question;
  userAnswerIndex: number;
}

interface Props {
  mistakes: MistakeItem[];
}

export default function MistakeReview({ mistakes }: Props) {
  if (mistakes.length === 0) {
    return (
      <div className="text-sm text-[#555] text-center py-4">
        You answered every question correctly.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold text-[#111]">Review your mistakes</h2>
      {mistakes.map(({ question, userAnswerIndex }, i) => (
        <div key={i} className="bg-white border border-[#E8E8E8] rounded-xl p-6 space-y-3">
          <p className="text-sm font-semibold text-[#111]">{question.question}</p>

          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-medium shrink-0">Your answer:</span>
              <span className="text-[#444]">{question.options[userAnswerIndex]}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-700 font-medium shrink-0">Correct answer:</span>
              <span className="text-[#444]">{question.options[question.correctIndex]}</span>
            </div>
          </div>

          <p className="text-sm text-[#333] leading-relaxed">
            <span className="font-medium">Explanation: </span>
            {question.explanation}
          </p>

          <blockquote className="border-l-2 border-slate-300 pl-3 text-sm text-[#666] italic leading-relaxed">
            {question.excerpt}
          </blockquote>
        </div>
      ))}
    </div>
  );
}
