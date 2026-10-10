import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utils/cx';

const VARIANTS = {
  primary: 'bg-accent text-accent-ink hover:brightness-110',
  secondary: 'bg-surface2 text-ink border border-line hover:border-mute/50',
  ghost: 'text-mute hover:text-ink hover:bg-surface2',
  danger: 'bg-bad/10 text-bad border border-bad/30 hover:bg-bad/20',
};
const SIZES = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-11 px-5 text-base' };

export function Button({ variant = 'primary', size = 'md', icon: Icon, className, children, ...rest }) {
  return (
    <button
      type="button"
      className={cx('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:pointer-events-none disabled:opacity-50', VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Card({ className, children, ...rest }) {
  return (
    <div className={cx('rounded-2xl border border-line bg-surface/80 p-5 backdrop-blur', className)} {...rest}>
      {children}
    </div>
  );
}

const TONES = {
  neutral: 'bg-surface2 text-mute border-line',
  accent: 'bg-accent/10 text-accent border-accent/30',
  ok: 'bg-ok/10 text-ok border-ok/30',
  warn: 'bg-warn/10 text-warn border-warn/30',
  bad: 'bg-bad/10 text-bad border-bad/30',
};
export function Badge({ tone = 'neutral', className, children }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', TONES[tone], className)}>{children}</span>;
}

export function ProgressBar({ value = 0, tone = 'accent', label, className }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const color = { accent: 'bg-accent', ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad' }[tone];
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full bg-surface2', className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cx('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

const fieldCls = 'w-full rounded-lg border border-line bg-surface2 px-3 text-sm text-ink placeholder:text-mute focus:border-accent focus:outline-none';

export function Input({ label, className, ...rest }) {
  const id = useId();
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-mute">{label}</label>}
      <input id={id} className={cx(fieldCls, 'h-10')} {...rest} />
    </div>
  );
}

export function Textarea({ label, className, ...rest }) {
  const id = useId();
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-mute">{label}</label>}
      <textarea id={id} className={cx(fieldCls, 'py-2')} {...rest} />
    </div>
  );
}

export function Select({ label, options = [], className, ...rest }) {
  const id = useId();
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-mute">{label}</label>}
      <select id={id} className={cx(fieldCls, 'h-10')} {...rest}>
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
      </select>
    </div>
  );
}

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div role="tablist" className={cx('flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cx('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition', value === t.id ? 'bg-surface2 text-ink' : 'text-mute hover:text-ink')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-md animate-pop overflow-auto rounded-t-2xl border border-line bg-surface p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="text-mute hover:text-ink"><X size={18} /></button>
        </div>
        <div className="text-sm text-mute">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
