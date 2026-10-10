import { cx } from '../../utils/cx';

export function ProgressRing({ value = 0, size = 120, stroke = 10, label }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label || 'Progress'} ${Math.round(pct)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--surface2))" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--accent))" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold">{Math.round(pct)}%</span>
        {label && <span className="text-xs text-mute">{label}</span>}
      </div>
    </div>
  );
}

export function BarChart({ data, height = 140 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-xs text-mute">{d.value || ''}</span>
          <div className={cx('w-full rounded-md transition-all duration-700', d.value ? 'bg-accent' : 'bg-surface2')} style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }} title={`${d.label}: ${d.value}`} />
          <span className="text-xs text-mute">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
