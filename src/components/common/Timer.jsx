import { Timer as TimerIcon } from 'lucide-react';
import { formatTime } from '../../utils/timer';
import { cx } from '../../utils/cx';

export default function Timer({ seconds, running }) {
  return (
    <span role="timer" className={cx('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-sm tabular-nums', running ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line bg-surface2 text-mute')}>
      <TimerIcon size={14} aria-hidden="true" />
      {formatTime(seconds)}
    </span>
  );
}
