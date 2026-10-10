import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { staticIndex, makeEntry } from '../../data/searchIndex';
import useBookmarks from '../../hooks/useBookmarks';
import { Badge } from '../ui';

export default function GlobalSearch() {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { items: bookmarks } = useBookmarks();

  const index = useMemo(
    () => [...staticIndex, ...bookmarks.map((b) => makeEntry('Revision', b.title, b.category || b.type, '/revision', b.note || ''))],
    [bookmarks]
  );
  const results = useMemo(() => {
    const words = term.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (term.trim().length < 2) return [];
    return index.filter((e) => words.every((w) => e.hay.includes(w))).slice(0, 8);
  }, [term, index]);

  useEffect(() => {
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const go = (entry) => {
    navigate(entry.path);
    setOpen(false);
    setTerm('');
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-md">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={term}
        aria-label="Search the whole app"
        placeholder="Search questions, flashcards, roadmaps…"
        onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0]);
          if (e.key === 'Escape') setOpen(false);
        }}
        className="h-10 w-full rounded-lg border border-line bg-surface2 pl-9 pr-3 text-sm placeholder:text-mute focus:border-accent focus:outline-none"
      />
      {open && term.trim().length >= 2 && (
        <ul role="listbox" className="absolute left-0 right-0 top-12 z-50 max-h-80 animate-pop overflow-auto rounded-xl border border-line bg-surface p-1 shadow-2xl">
          {results.length === 0 && <li className="px-3 py-4 text-sm text-mute">No matches for “{term}”.</li>}
          {results.map((r) => (
            <li key={`${r.type}-${r.path}-${r.title}`} role="option" aria-selected="false">
              <button type="button" onClick={() => go(r)} className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface2">
                <Badge tone="accent" className="mt-0.5 shrink-0">{r.type}</Badge>
                <span className="min-w-0">
                  <span className="block truncate text-sm">{r.title}</span>
                  <span className="block truncate text-xs text-mute">{r.meta}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
