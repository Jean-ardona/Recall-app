'use client';

import { getAvailableCounts, type QuestionCount } from '@/lib/schemas';

interface Props {
  wordCount: number;
  selected: QuestionCount;
  onChange: (count: QuestionCount) => void;
  disabled?: boolean;
}

const ALL: QuestionCount[] = [5, 10, 15];

export default function QuestionCountSelector({ wordCount, selected, onChange, disabled }: Props) {
  const available = getAvailableCounts(wordCount);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" style={{ color: 'var(--mute)' }}>
        Number of questions
      </label>

      <div className="seg-control">
        {ALL.map((count) => {
          const isAvailable = available.includes(count);
          const isActive = selected === count && isAvailable;
          return (
            <button
              key={count}
              type="button"
              disabled={disabled || !isAvailable}
              onClick={() => isAvailable && onChange(count)}
              className={`seg-btn${isActive ? ' active' : ''}`}
            >
              {count}
            </button>
          );
        })}
      </div>

      {wordCount > 0 && available.length === 0 && (
        <p className="text-xs mt-1" style={{ color: 'var(--bad)' }}>
          Your text is too short. Paste at least 150 words.
        </p>
      )}
      {wordCount >= 150 && wordCount < 800 && (
        <p className="text-xs mt-1" style={{ color: 'var(--mute)' }}>
          Add more text to unlock higher question counts.
        </p>
      )}
    </div>
  );
}
