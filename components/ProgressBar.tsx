interface Props {
  current: number; // 1-based
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="w-full flex flex-col gap-2">
      <span className="text-sm font-medium text-[#555]">
        Question {current} of {total}
      </span>
      <div className="w-full h-1 bg-[#E8E8E8] rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-800 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
