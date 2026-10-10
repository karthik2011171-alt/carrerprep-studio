import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ExternalLink, Check } from 'lucide-react';
import { PageHeader, EmptyState } from '../../components/common';
import { Badge, Button, Card, Input, Select, Textarea } from '../../components/ui';
import useBookmarks from '../../hooks/useBookmarks';

const TYPE_LABELS = { question: 'Interview question', coding: 'Coding problem', debugging: 'Debugging challenge', flashcard: 'Flashcard', company: 'Company roadmap' };

export default function RevisionNotes() {
  const { items, update, remove } = useBookmarks();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(items.map((b) => b.category).filter(Boolean))], [items]);
  const list = useMemo(() => {
    const t = search.trim().toLowerCase();
    return items.filter(
      (b) => (type === 'all' || b.type === type) && (category === 'All' || b.category === category) && (!t || `${b.title} ${b.note}`.toLowerCase().includes(t))
    );
  }, [items, search, type, category]);

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="My Revision" subtitle="Everything you bookmark across the app lands here." />
        <EmptyState icon={Bookmark} title="No revision items yet" text="Tap the bookmark icon on any question, flashcard or roadmap to save it here." action={<Link to="/interview-bank"><Button>Browse interview questions</Button></Link>} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="My Revision" subtitle={`${items.filter((b) => b.done).length} of ${items.length} items revised.`} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Input label="Search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title or note" />
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={[{ value: 'all', label: 'All types' }, ...Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))]} />
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={categories} />
      </div>
      {list.length === 0 && <EmptyState title="Nothing matches those filters" />}
      <div className="space-y-3">
        {list.map((b) => (
          <Card key={b.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={b.done ? 'font-medium text-mute line-through' : 'font-medium'}>{b.title}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="accent">{TYPE_LABELS[b.type] || b.type}</Badge>
                  {b.category && <Badge>{b.category}</Badge>}
                  <Badge>Updated {new Date(b.updatedAt).toLocaleDateString()}</Badge>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                {b.path && <Link to={b.path} aria-label="Open item" className="rounded-lg p-2 text-mute hover:bg-surface2 hover:text-ink"><ExternalLink size={16} /></Link>}
                <button type="button" onClick={() => remove(b.id)} aria-label="Delete bookmark" className="rounded-lg p-2 text-mute hover:bg-bad/10 hover:text-bad"><Trash2 size={16} /></button>
              </div>
            </div>
            <Textarea label="Notes" rows={2} value={b.note || ''} onChange={(e) => update(b.id, { note: e.target.value })} placeholder="Add a reminder or your own explanation…" />
            <Button size="sm" variant={b.done ? 'secondary' : 'primary'} icon={Check} onClick={() => update(b.id, { done: !b.done })}>{b.done ? 'Mark as not revised' : 'Mark as revised'}</Button>
          </Card>
        ))}
      </div>
    </>
  );
}
