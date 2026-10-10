'use client';

import { getAvailableCounts, type QuestionCount } from '@/lib/schemas';

interface Props {
  wordCount: number;
  selected: QuestionCount;
  onChange: (count: QuestionCount) => void;
  disabled?: boolean;
}

export default function QuestionCountSelector({ wordCount, selected, onChange, disabled }: Props) {
  const available = getAvailableCounts(wordCount);
  const allCounts: QuestionCount[] = [5, 10, 15];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#555]">Number of questions</label>
      <div className="flex gap-2">
        {allCounts.map((count) => {
          const isAvailable = available.includes(count);
          const isSelected = selected === count;
          return (
            <button
              key={count}
              type="button"
              disabled={disabled || !isAvailable}
              onClick={() => isAvailable && onChange(count)}
              className={`
                px-5 py-2 rounded-md text-sm font-medium border transition-colors
                ${isSelected && isAvailable
                  ? 'bg-slate-800 text-white border-slate-800'
                  : isAvailable
                  ? 'bg-white text-[#111] border-[#DDD] hover:border-slate-400'
                  : 'bg-[#F3F3F3] text-[#BBB] border-[#E8E8E8] cursor-not-allowed'}
              `}
            >
              {count}
            </button>
          );
        })}
      </div>
      {wordCount > 0 && available.length === 0 && (
        <p className="text-xs text-red-600 mt-1">
          Your text is too short. Paste at least 150 words of notes.
        </p>
      )}
      {wordCount >= 150 && wordCount < 800 && (
        <p className="text-xs text-[#888] mt-1">
          Add more text to unlock higher question counts.
        </p>
      )}
    </div>
  );
}
