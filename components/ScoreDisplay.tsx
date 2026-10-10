interface Props {
  correct: number;
  total: number;
}

function getNeutralMessage(score: number): string {
  if (score === 100) return 'Perfect score. Everything you reviewed was correct.';
  if (score >= 80) return 'Strong result. A few questions to review below.';
  if (score >= 60) return 'Decent foundation. Worth revisiting the sections below.';
  if (score >= 40) return 'Some gaps worth addressing before the exam.';
  return 'This material needs more review. Check the breakdown below.';
}

export default function ScoreDisplay({ correct, total }: Props) {
  const percent = Math.round((correct / total) * 100);
  const message = getNeutralMessage(percent);

  // SVG circular indicator
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Circular score */}
      <div className="relative flex items-center justify-center">
        <svg width="110" height="110" className="-rotate-90">
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="#E8E8E8"
            strokeWidth="8"
          />
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-[#111]">
            {correct}/{total}
          </span>
          <span className="text-xs text-[#888]">{percent}%</span>
        </div>
      </div>

      <p className="text-sm text-[#555] text-center max-w-xs">{message}</p>
    </div>
  );
}
