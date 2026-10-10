import { NavLink } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { NAV_ITEMS } from './nav';
import { cx } from '../../utils/cx';
import useSettings from '../../hooks/useSettings';

export function NavList({ onNavigate }) {
  return (
    <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cx('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'bg-accent/10 text-accent' : 'text-mute hover:bg-surface2 hover:text-ink')
          }
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-ink"><GraduationCap size={20} aria-hidden="true" /></div>
      <span className="font-semibold tracking-tight">CareerPrep Studio</span>
    </div>
  );
}

export default function Sidebar({ onNavigate }) {
  const [settings] = useSettings();
  const initials = (settings.name || 'You').trim().slice(0, 2).toUpperCase();
  return (
    <div className="flex h-full flex-col">
      <Brand />
      <NavList onNavigate={onNavigate} />
      <div className="m-3 flex items-center gap-3 rounded-xl border border-line bg-surface2/50 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{initials}</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{settings.name || 'Your profile'}</p>
          <p className="truncate text-xs text-mute">{settings.role}</p>
        </div>
      </div>
    </div>
  );
}
