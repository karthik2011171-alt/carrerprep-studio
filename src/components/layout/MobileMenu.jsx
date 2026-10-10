import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileMenu({ open, onClose }) {
  const { pathname } = useLocation();
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] animate-fade-in border-r border-line bg-bg" aria-label="Navigation menu">
        <button type="button" onClick={onClose} aria-label="Close menu" className="absolute right-3 top-4 text-mute hover:text-ink"><X size={20} /></button>
        <Sidebar onNavigate={onClose} />
      </aside>
    </div>
  );
}
