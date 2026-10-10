interface Props {
  current: number; // 1-based
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="flex flex-col gap-2" style={{ width: 'min(88vw, 400px)' }}>
      <span className="text-sm font-medium" style={{ color: 'var(--mute)' }}>
        Question {current} of {total}
      </span>
      <div
        className="w-full overflow-hidden"
        style={{ height: 3, background: 'var(--line)', borderRadius: 3 }}
      >
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            background: 'var(--accent)',
            borderRadius: 3,
            transition: 'width .5s cubic-bezier(.2,.8,.2,1)',
          }}
        />
      </div>
    </div>
  );
}
