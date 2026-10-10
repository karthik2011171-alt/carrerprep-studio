import { Bookmark, BookmarkCheck, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import { Card, Button } from '../ui';
import { cx } from '../../utils/cx';
import useBookmarks from '../../hooks/useBookmarks';
import { useToast } from '../../context/ToastContext';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="page-title text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-mute">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'accent' }) {
  const color = { accent: 'text-accent bg-accent/10', ok: 'text-ok bg-ok/10', warn: 'text-warn bg-warn/10', bad: 'text-bad bg-bad/10' }[tone];
  return (
    <Card className="flex items-center gap-4 p-4">
      {Icon && <div className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', color)}><Icon size={20} aria-hidden="true" /></div>}
      <div className="min-w-0">
        <p className="truncate text-sm text-mute">{label}</p>
        <p className="text-xl font-semibold leading-tight">{value}</p>
        {hint && <p className="truncate text-xs text-mute">{hint}</p>}
      </div>
    </Card>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      {Icon && <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface2 text-mute"><Icon size={22} aria-hidden="true" /></div>}
      <h3 className="font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-mute">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ text = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-mute" role="status">
      <Loader2 className="animate-spin" size={20} aria-hidden="true" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-bad/30 bg-bad/5 px-6 py-10 text-center" role="alert">
      <AlertTriangle className="mb-3 text-bad" size={24} aria-hidden="true" />
      <p className="text-sm">{message}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

// item: { id: 'type:rawId', type, title, category, path }
export function BookmarkButton({ item, className }) {
  const { isBookmarked, toggle } = useBookmarks();
  const { toast } = useToast();
  const active = isBookmarked(item.id);
  const Icon = active ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Remove bookmark' : 'Add bookmark'}
      onClick={(e) => {
        e.stopPropagation();
        toast(toggle(item) ? 'Saved to My Revision' : 'Removed from My Revision', 'info');
      }}
      className={cx('rounded-lg p-2 transition hover:bg-surface2', active ? 'text-accent' : 'text-mute hover:text-ink', className)}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}

// Reusable expandable question card (interview bank now, coding/debugging lists later)
export function QuestionCard({ title, badges, bookmarkItem, open, onToggle, children }) {
  return (
    <Card className="p-0">
      <div className="flex items-start gap-2 p-4">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-start gap-3 text-left">
          <ChevronDown size={18} className={cx('mt-0.5 shrink-0 text-mute transition-transform', open && 'rotate-180')} aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-medium leading-snug">{title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div>
          </div>
        </button>
        {bookmarkItem && <BookmarkButton item={bookmarkItem} />}
      </div>
      {open && <div className="animate-fade-in space-y-4 border-t border-line p-4">{children}</div>}
    </Card>
  );
}

export function difficultyTone(d) {
  return d === 'Easy' || d === 'Beginner' ? 'ok' : d === 'Medium' ? 'warn' : 'bad';
}
