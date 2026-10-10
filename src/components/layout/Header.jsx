import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, Flame } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { NAV_ITEMS } from './nav';
import useSettings from '../../hooks/useSettings';
import useProgress from '../../hooks/useProgress';

export default function Header({ onMenu }) {
  const { pathname } = useLocation();
  const [settings, update] = useSettings();
  const { streak } = useProgress();
  const current = NAV_ITEMS.find((n) => n.to === pathname);
  const isLight = settings.theme === 'light';

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenu} aria-label="Open menu" className="rounded-lg p-2 text-mute hover:bg-surface2 hover:text-ink lg:hidden"><Menu size={20} /></button>
        <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm text-mute md:flex">
          <Link to="/dashboard" className="hover:text-ink">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{current ? current.label : 'Page'}</span>
        </nav>
        <div className="flex flex-1 justify-center md:justify-end"><GlobalSearch /></div>
        <Link to="/streak" className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-sm font-medium" aria-label={`Current streak ${streak.current} days`}>
          <Flame size={16} className={streak.current ? 'text-warn' : 'text-mute'} aria-hidden="true" />{streak.current}
        </Link>
        <button type="button" onClick={() => update({ theme: isLight ? 'dark' : 'light' })} aria-label="Toggle theme" className="rounded-lg p-2 text-mute hover:bg-surface2 hover:text-ink">
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
