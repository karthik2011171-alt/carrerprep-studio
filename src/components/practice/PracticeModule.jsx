import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Wifi, WifiOff, SearchX, Play } from 'lucide-react';
import { PageHeader, BookmarkButton, EmptyState, ErrorState, difficultyTone } from '../common';
import { Badge, Button, Card, Input, Select } from '../ui';
import Workspace from './Workspace';
import useLocalStorage from '../../hooks/useLocalStorage';
import { formatTime } from '../../utils/timer';

const PAGE = 20;
const ALL = 'All';

// Shared by Coding Arena and Debugging Challenge. Each page supplies its own loader, dataset and progress key.
export default function PracticeModule({ config }) {
  const [params, setParams] = useSearchParams();
  const [progress, setProgress] = useLocalStorage(config.progressKey, { attempts: [], solved: {} });
  const [data, setData] = useState({ status: 'loading', items: config.fallback, source: '', message: '', remoteCount: 0 });
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState(ALL);
  const [topic, setTopic] = useState(ALL);
  const [difficulty, setDifficulty] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setData((d) => ({ ...d, status: 'loading' }));
      try {
        const res = await config.loader();
        if (!cancelled) setData({ status: 'ready', items: res.questions, source: res.source, message: res.message || '', remoteCount: res.remoteCount || 0 });
      } catch (err) {
        if (!cancelled) setData({ status: 'error', items: config.fallback, source: 'fallback', message: err.message || 'Unknown error', remoteCount: 0 });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [config, reloadKey]);

  const solvedMap = progress.solved && typeof progress.solved === 'object' ? progress.solved : {};
  const items = data.items;
  const topics = useMemo(() => [ALL, ...new Set(items.filter((i) => level === ALL || i.level === level).map((i) => i.topic))], [items, level]);
  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        (level === ALL || i.level === level) &&
        (topic === ALL || i.topic === topic) &&
        (difficulty === ALL || i.difficulty === difficulty) &&
        (status === ALL || (status === 'solved' ? solvedMap[i.id] : !solvedMap[i.id])) &&
        (!t || `${i.title} ${i.topic} ${i.statement}`.toLowerCase().includes(t))
    );
  }, [items, search, level, topic, difficulty, status, solvedMap]);

  const activeId = params.get('id');
  const active = activeId ? items.find((i) => i.id === activeId) : null;
  const open = (id) => setParams(id ? { id } : {});
  const nextItem = () => {
    const list = filtered.length ? filtered : items;
    const idx = list.findIndex((i) => i.id === activeId);
    const pick = list.slice(idx + 1).find((i) => !solvedMap[i.id]) || list[(idx + 1) % list.length];
    return pick && pick.id !== activeId ? () => open(pick.id) : undefined;
  };

  if (active) {
    return <Workspace key={active.id} item={active} config={config} progress={progress} setProgress={setProgress} onBack={() => open(null)} onNext={nextItem()} />;
  }

  const solvedCount = items.filter((i) => solvedMap[i.id]).length;
  const resetFilters = () => { setSearch(''); setLevel(ALL); setTopic(ALL); setDifficulty(ALL); setStatus(ALL); };

  return (
    <>
      <PageHeader title={config.title} subtitle={config.subtitle} actions={<Badge tone="ok"><CheckCircle2 size={12} aria-hidden="true" />{solvedCount} of {items.length} {config.solvedWord}</Badge>} />

      <div className="mb-5">
        {data.status === 'loading' && <p className="flex items-center gap-2 text-sm text-mute" role="status"><Loader2 size={15} className="animate-spin" aria-hidden="true" />Checking {config.sourceName} for more {config.pluralLabel}…</p>}
        {data.status !== 'loading' && data.source === 'api' && <p className="flex items-center gap-2 text-sm text-ok"><Wifi size={15} aria-hidden="true" />Live source connected: {data.remoteCount} extra {config.pluralLabel} loaded from {config.sourceName}.</p>}
        {data.status !== 'loading' && data.source === 'fallback' && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-mute">
            <span className="flex items-center gap-2"><WifiOff size={15} aria-hidden="true" />Offline mode: using the built-in set ({data.message}).</span>
            <Button size="sm" variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>Retry</Button>
          </div>
        )}
      </div>
      {data.status === 'error' && <div className="mb-5"><ErrorState message={`Could not load challenges: ${data.message}. Showing the built-in set.`} onRetry={() => setReloadKey((k) => k + 1)} /></div>}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input className="lg:col-span-2" label="Search" type="search" value={search} onChange={(e) => { setSearch(e.target.value); setShown(PAGE); }} placeholder="Title, topic or keyword" />
        {config.hasLevels ? <Select label="Level" value={level} onChange={(e) => { setLevel(e.target.value); setTopic(ALL); setShown(PAGE); }} options={[ALL, 'Beginner', 'Advanced']} /> : <Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setShown(PAGE); }} options={[{ value: ALL, label: 'All' }, { value: 'unsolved', label: 'Unsolved' }, { value: 'solved', label: 'Solved' }]} />}
        <Select label={config.topicLabel} value={topic} onChange={(e) => { setTopic(e.target.value); setShown(PAGE); }} options={topics} />
        <Select label="Difficulty" value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setShown(PAGE); }} options={[ALL, 'Easy', 'Medium', 'Hard']} />
        {config.hasLevels && <Select className="lg:col-span-1" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setShown(PAGE); }} options={[{ value: ALL, label: 'All' }, { value: 'unsolved', label: 'Unsolved' }, { value: 'solved', label: 'Solved' }]} />}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title={`No ${config.pluralLabel} match`} text="Try a different search or clear a filter." action={<Button variant="secondary" onClick={resetFilters}>Clear filters</Button>} />
      ) : (
        <>
          {solvedCount === 0 && <p className="mb-3 text-sm text-mute">Start your first {config.singularLabel}. Pick any card below.</p>}
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.slice(0, shown).map((i) => (
              <Card key={i.id} className="flex items-start gap-2 p-4 transition hover:border-accent/50">
                <button type="button" onClick={() => open(i.id)} className="min-w-0 flex-1 text-left">
                  <p className="flex items-center gap-2 font-medium">
                    {solvedMap[i.id] && <CheckCircle2 size={16} className="shrink-0 text-ok" aria-label="Solved" />}
                    <span className="truncate">{i.title}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {i.level && <Badge tone="accent">{i.level}</Badge>}
                    <Badge>{i.topic}</Badge>
                    <Badge tone={difficultyTone(i.difficulty)}>{i.difficulty}</Badge>
                    {solvedMap[i.id] && <Badge tone="ok">Best {formatTime(solvedMap[i.id].seconds)}</Badge>}
                  </div>
                </button>
                <BookmarkButton item={{ id: `${config.kind}:${i.id}`, type: config.kind, title: i.title, category: i.topic, path: `${config.route}?id=${i.id}` }} />
                <Button size="sm" variant="secondary" icon={Play} onClick={() => open(i.id)} aria-label={`Start ${i.title}`}>Start</Button>
              </Card>
            ))}
          </div>
          {filtered.length > shown && <div className="mt-5 flex justify-center"><Button variant="secondary" onClick={() => setShown((s) => s + PAGE)}>Show more ({filtered.length - shown} left)</Button></div>}
        </>
      )}
    </>
  );
}
