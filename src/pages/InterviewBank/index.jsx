import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchX, CheckCircle2 } from 'lucide-react';
import { PageHeader, QuestionCard, EmptyState, difficultyTone } from '../../components/common';
import { Badge, Button, Input, Select, Textarea } from '../../components/ui';
import { interviewQuestions, QUESTION_CATEGORIES } from '../../data/interviewQuestions';
import useLocalStorage from '../../hooks/useLocalStorage';
import { KEYS } from '../../utils/localStorage';
import { logActivity } from '../../utils/activity';
import { useToast } from '../../context/ToastContext';

export default function InterviewBank() {
  const [params] = useSearchParams();
  const { toast } = useToast();
  const [search, setSearch] = useState(params.get('q') || '');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const [openId, setOpenId] = useState(null);
  const [reviewed, setReviewed] = useLocalStorage(KEYS.questions, {});
  const [notes, setNotes] = useLocalStorage(KEYS.notes, {});

  const topics = useMemo(
    () => ['All', ...new Set(interviewQuestions.filter((x) => category === 'All' || x.category === category).map((x) => x.topic))],
    [category]
  );
  const list = useMemo(() => {
    const t = search.trim().toLowerCase();
    return interviewQuestions.filter(
      (x) =>
        (category === 'All' || x.category === category) &&
        (difficulty === 'All' || x.difficulty === difficulty) &&
        (topic === 'All' || x.topic === topic) &&
        (!t || `${x.question} ${x.topic} ${x.answer}`.toLowerCase().includes(t))
    );
  }, [search, category, difficulty, topic]);

  const toggleReviewed = (x) => {
    const next = !reviewed[x.id];
    setReviewed((cur) => ({ ...cur, [x.id]: next }));
    if (next) {
      logActivity('question', `Reviewed: ${x.question}`);
      toast('Marked as reviewed');
    }
  };

  return (
    <>
      <PageHeader title="Interview Question Bank" subtitle={`${interviewQuestions.length} questions with professional answers, simple explanations and key points.`} />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Closures, STAR, hooks…" />
        <Select label="Category" value={category} onChange={(e) => { setCategory(e.target.value); setTopic('All'); }} options={QUESTION_CATEGORIES} />
        <Select label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} options={topics} />
        <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} options={['All', 'Easy', 'Medium', 'Hard']} />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={SearchX} title="No questions match" text="Try a different search or clear a filter." action={<Button variant="secondary" onClick={() => { setSearch(''); setCategory('All'); setTopic('All'); setDifficulty('All'); }}>Clear filters</Button>} />
      ) : (
        <div className="space-y-3">
          {list.map((x) => (
            <QuestionCard
              key={x.id}
              title={x.question}
              open={openId === x.id}
              onToggle={() => setOpenId(openId === x.id ? null : x.id)}
              bookmarkItem={{ id: `question:${x.id}`, type: 'question', title: x.question, category: x.category, path: `/interview-bank?q=${encodeURIComponent(x.question.slice(0, 40))}` }}
              badges={
                <>
                  <Badge tone="accent">{x.category}</Badge>
                  <Badge>{x.topic}</Badge>
                  <Badge tone={difficultyTone(x.difficulty)}>{x.difficulty}</Badge>
                  {reviewed[x.id] && <Badge tone="ok"><CheckCircle2 size={12} aria-hidden="true" />Reviewed</Badge>}
                </>
              }
            >
              <div><h3 className="mb-1 text-sm font-semibold">Professional answer</h3><p className="text-sm text-mute">{x.answer}</p></div>
              <div><h3 className="mb-1 text-sm font-semibold">In simple words</h3><p className="text-sm text-mute">{x.simple}</p></div>
              <div><h3 className="mb-1 text-sm font-semibold">Key points</h3><ul className="list-disc space-y-1 pl-5 text-sm text-mute">{x.points.map((pt) => <li key={pt}>{pt}</li>)}</ul></div>
              <Textarea label="Your notes" rows={3} value={notes[`question:${x.id}`] || ''} onChange={(e) => setNotes((cur) => ({ ...cur, [`question:${x.id}`]: e.target.value }))} placeholder="Write your own answer or reminders…" />
              <Button variant={reviewed[x.id] ? 'secondary' : 'primary'} size="sm" icon={CheckCircle2} onClick={() => toggleReviewed(x)}>{reviewed[x.id] ? 'Reviewed — undo' : 'Mark as reviewed'}</Button>
            </QuestionCard>
          ))}
        </div>
      )}
      <p className="mt-6 text-sm text-mute">Saved questions appear in <Link to="/revision" className="text-accent underline">My Revision</Link>.</p>
    </>
  );
}
