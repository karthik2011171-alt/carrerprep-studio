import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, RefreshCw, ChevronLeft, ChevronRight, Layers, Shuffle, Flame, Target, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader, BookmarkButton, EmptyState } from '../../components/common';
import CodeBlock from '../../components/common/CodeBlock';
import { Badge, Button, Card, ProgressBar, Select, Tabs } from '../../components/ui';
import { allFlashcards, FLASHCARD_SUBJECTS, SUBJECT_LANG } from '../../data/flashcards';
import useLocalStorage from '../../hooks/useLocalStorage';
import useProgress from '../../hooks/useProgress';
import { KEYS } from '../../utils/localStorage';
import { dayKey, logActivity } from '../../utils/activity';
import { isDue, scheduleRevision } from '../../utils/srs';
import { useToast } from '../../context/ToastContext';
import { cx } from '../../utils/cx';

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const short = (a) => {
  const m = a.match(/^.*?[.!?](\s|$)/);
  const s = (m ? m[0] : a).trim();
  return s.length > 170 ? `${s.slice(0, 167)}…` : s;
};

export default function Flashcards() {
  const [params] = useSearchParams();
  const { toast } = useToast();
  const { streak } = useProgress();
  const startCard = allFlashcards.find((c) => c.id === params.get('card'));
  const [status, setStatus] = useLocalStorage(KEYS.flashcards, {});
  const [srs, setSrs] = useLocalStorage(KEYS.flashcardSrs, {});
  const [daily, setDaily] = useLocalStorage(KEYS.flashcardDaily, {});

  const [subject, setSubject] = useState(startCard ? startCard.subject : 'React');
  const [topic, setTopic] = useState('All');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('study');
  const [shuffle, setShuffle] = useState(false);
  const [seed, setSeed] = useState(1);
  const [index, setIndex] = useState(() => (startCard ? allFlashcards.filter((c) => c.subject === startCard.subject).findIndex((c) => c.id === startCard.id) : 0));
  const [flipped, setFlipped] = useState(false);
  const [quizPos, setQuizPos] = useState(0);
  const [answered, setAnswered] = useState(null); // { card, picked, correct }
  const [score, setScore] = useState({ right: 0, total: 0 });

  const today = dayKey();
  const goal = daily.goal || 10;
  const todayCount = daily.date === today ? daily.count || 0 : 0;

  const subjectCards = useMemo(() => allFlashcards.filter((c) => c.subject === subject), [subject]);
  const topics = useMemo(() => ['All', ...new Set(subjectCards.map((c) => c.topic))], [subjectCards]);
  const known = subjectCards.filter((c) => status[c.id] === 'known').length;
  const revise = subjectCards.filter((c) => status[c.id] === 'revise').length;
  const dueCount = subjectCards.filter((c) => status[c.id] === 'revise' && isDue(srs[c.id])).length;
  const overallKnown = allFlashcards.filter((c) => status[c.id] === 'known').length;
  const pct = Math.round((known / subjectCards.length) * 100);

  const deck = useMemo(() => {
    const list = subjectCards.filter((c) => {
      if (topic !== 'All' && c.topic !== topic) return false;
      if (filter === 'new') return !status[c.id];
      if (filter === 'revise') return status[c.id] === 'revise';
      if (filter === 'due') return status[c.id] === 'revise' && isDue(srs[c.id]);
      if (filter === 'known') return status[c.id] === 'known';
      return true;
    });
    return shuffle ? [...list].sort((a, b) => hash(a.id + seed) - hash(b.id + seed)) : list;
  }, [subjectCards, topic, filter, status, srs, shuffle, seed]);

  const safeIndex = Math.min(index, Math.max(0, deck.length - 1));
  const card = deck[safeIndex];
  const quizCard = answered ? answered.card : deck[quizPos % Math.max(1, deck.length)];

  // Records an answer: status, spaced-repetition schedule, daily goal and streak activity.
  const record = (target, value) => {
    if (status[target.id] !== value) logActivity('flashcard', `${value === 'known' ? 'Knew' : 'Revising'} (${target.subject}): ${target.q}`);
    setStatus((cur) => ({ ...cur, [target.id]: value }));
    setSrs((cur) => {
      const next = { ...cur };
      if (value === 'known') delete next[target.id];
      else next[target.id] = scheduleRevision(cur[target.id]);
      return next;
    });
    const count = todayCount + 1;
    const alreadyReached = daily.date === today && daily.reached;
    setDaily({ ...daily, date: today, count, goal, reached: count >= goal });
    if (count >= goal && !alreadyReached) {
      toast(`Daily goal reached: ${goal} cards! 🎉`);
      logActivity('flashcard', `Reached the daily goal of ${goal} flashcards`);
    }
  };

  const resetView = () => { setIndex(0); setFlipped(false); setQuizPos(0); setAnswered(null); };
  const go = (step) => {
    if (!deck.length) return;
    setFlipped(false);
    setIndex((safeIndex + step + deck.length) % deck.length);
  };

  const mark = (value) => {
    if (!card) return;
    record(card, value);
    setFlipped(false);
    // Advance only if the card stays in this view after being marked
    const stays = filter === 'all' || (filter === 'revise' && value === 'revise') || filter === 'known' && value === 'known';
    if (stays) setIndex((safeIndex + 1) % deck.length);
  };

  const options = useMemo(() => {
    if (!quizCard) return [];
    const pool = subjectCards.filter((c) => c.id !== quizCard.id);
    const ranked = (list) => [...list].sort((a, b) => hash(a.id + quizCard.id + seed) - hash(b.id + quizCard.id + seed));
    const correct = short(quizCard.a);
    const wrong = [];
    [...ranked(pool.filter((c) => c.topic === quizCard.topic)), ...ranked(pool.filter((c) => c.topic !== quizCard.topic))].forEach((c) => {
      const t = short(c.a);
      if (wrong.length < 3 && t !== correct && !wrong.includes(t)) wrong.push(t);
    });
    return [{ text: correct, correct: true }, ...wrong.map((text) => ({ text, correct: false }))].sort((a, b) => hash(a.text + quizCard.id + seed) - hash(b.text + quizCard.id + seed));
  }, [quizCard, subjectCards, seed]);

  const pick = (opt) => {
    if (answered || !quizCard) return;
    record(quizCard, opt.correct ? 'known' : 'revise');
    setAnswered({ card: quizCard, picked: opt.text, correct: opt.correct });
    setScore((s) => ({ right: s.right + (opt.correct ? 1 : 0), total: s.total + 1 }));
  };
  const nextQuiz = () => {
    const left = answered && !deck.some((c) => c.id === answered.card.id);
    setAnswered(null);
    setQuizPos((p) => (left ? p : p + 1));
  };

  useEffect(() => {
    if (view !== 'study') return undefined;
    const onKey = (e) => {
      if (e.target !== document.body) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const filterOptions = [
    { value: 'all', label: 'All cards' },
    { value: 'new', label: 'Not reviewed yet' },
    { value: 'revise', label: `Revise only (${revise})` },
    { value: 'due', label: `Due today (${dueCount})` },
    { value: 'known', label: `Known (${known})` },
  ];

  const emptyMessage = filter === 'due' ? 'Nothing is due today. Cards you mark "Need revision" come back tomorrow, then after 3 days.' : filter === 'revise' ? 'No cards need revision. Great work!' : 'Change the topic or filter to see more cards.';

  return (
    <>
      <PageHeader title="Flashcards" subtitle="Study with flip cards or test yourself with a quiz. Cards you miss come back automatically." />

      <Tabs className="mb-4" value={subject} onChange={(s) => { setSubject(s); setTopic('All'); setFilter('all'); setScore({ right: 0, total: 0 }); resetView(); }} tabs={FLASHCARD_SUBJECTS.map((s) => ({ id: s, label: s }))} />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Topic" value={topic} onChange={(e) => { setTopic(e.target.value); resetView(); }} options={topics} />
        <Select label="Show" value={filter} onChange={(e) => { setFilter(e.target.value); resetView(); }} options={filterOptions} />
        <div>
          <span className="mb-1.5 block text-sm font-medium text-mute">Mode</span>
          <Tabs value={view} onChange={(v) => { setView(v); setFlipped(false); setAnswered(null); }} tabs={[{ id: 'study', label: 'Study' }, { id: 'quiz', label: 'Quiz' }]} />
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-mute">Order</span>
          <div className="flex gap-2">
            <Button variant={shuffle ? 'primary' : 'secondary'} icon={Shuffle} aria-pressed={shuffle} onClick={() => { setShuffle((s) => !s); resetView(); }}>{shuffle ? 'Shuffled' : 'Shuffle'}</Button>
            {shuffle && <Button variant="secondary" onClick={() => { setSeed((s) => s + 1); resetView(); }} aria-label="Reshuffle cards">Reshuffle</Button>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!deck.length ? (
            <EmptyState icon={Layers} title="No cards in this view" text={emptyMessage} action={<Button variant="secondary" onClick={() => { setTopic('All'); setFilter('all'); }}>Show all cards</Button>} />
          ) : view === 'study' ? (
            <>
              <div className="mb-2 flex items-center justify-between text-sm text-mute">
                <span>Card {safeIndex + 1} of {deck.length}</span>
                <span className="flex items-center gap-2">
                  {status[card.id] === 'known' && <Badge tone="ok">Known</Badge>}
                  {status[card.id] === 'revise' && <Badge tone="warn">{isDue(srs[card.id]) ? 'Due today' : `Back on ${srs[card.id]?.due || 'soon'}`}</Badge>}
                  <BookmarkButton item={{ id: `flashcard:${card.id}`, type: 'flashcard', title: card.q, category: `${card.subject} · ${card.topic}`, path: `/flashcards?card=${card.id}` }} />
                </span>
              </div>
              <div
                role="button"
                tabIndex={0}
                aria-label={flipped ? 'Showing answer. Press to show question' : 'Showing question. Press to show answer'}
                onClick={() => setFlipped((f) => !f)}
                onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setFlipped((f) => !f); } }}
                className="h-80 cursor-pointer [perspective:1200px] sm:h-[26rem]"
              >
                <div className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  <Card className="absolute inset-0 flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
                    <Badge tone="accent" className="mb-4">{card.subject} · {card.topic}</Badge>
                    <p className="text-xl font-semibold leading-snug sm:text-2xl">{card.q}</p>
                    <p className="mt-6 text-xs text-mute">Click to reveal the answer</p>
                  </Card>
                  <Card className="absolute inset-0 overflow-auto [backface-visibility:hidden] [transform:rotateY(180deg)]" onClick={(e) => e.target.closest('.cm-editor') && e.stopPropagation()}>
                    <p className="text-sm leading-relaxed">{card.a}</p>
                    {flipped && card.code && <CodeBlock key={card.id} code={card.code} lang={card.lang || SUBJECT_LANG[card.subject]} />}
                  </Card>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Button variant="secondary" icon={ChevronLeft} onClick={() => go(-1)} aria-label="Previous card">Previous</Button>
                  <Button variant="secondary" onClick={() => go(1)} aria-label="Next card">Next<ChevronRight size={16} aria-hidden="true" /></Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" icon={RefreshCw} onClick={() => mark('revise')}>Need revision</Button>
                  <Button icon={Check} onClick={() => mark('known')}>Known</Button>
                </div>
              </div>
            </>
          ) : (
            <Card className="space-y-4">
              <div className="flex items-center justify-between text-sm text-mute">
                <Badge tone="accent">{quizCard.subject} · {quizCard.topic}</Badge>
                <span>Quiz score: {score.right}/{score.total}</span>
              </div>
              <p className="text-lg font-semibold leading-snug">{quizCard.q}</p>
              <div className="space-y-2" role="group" aria-label="Answer options">
                {options.map((o, i) => {
                  const chosen = answered && answered.picked === o.text;
                  const showCorrect = answered && o.correct;
                  return (
                    <button
                      key={o.text}
                      type="button"
                      disabled={Boolean(answered)}
                      onClick={() => pick(o)}
                      className={cx('flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition', !answered && 'border-line hover:border-accent/60 hover:bg-surface2', showCorrect && 'border-ok/50 bg-ok/10', chosen && !o.correct && 'border-bad/50 bg-bad/10', answered && !showCorrect && !chosen && 'border-line opacity-60')}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-xs">{showCorrect ? <CheckCircle2 size={16} className="text-ok" aria-label="Correct answer" /> : chosen ? <XCircle size={16} className="text-bad" aria-label="Your answer" /> : String.fromCharCode(65 + i)}</span>
                      <span>{o.text}</span>
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div className="animate-fade-in space-y-3 border-t border-line pt-4">
                  <p className={cx('text-sm font-medium', answered.correct ? 'text-ok' : 'text-bad')}>{answered.correct ? 'Correct! Marked as known.' : 'Not quite. Added to your revision list; it returns tomorrow.'}</p>
                  <p className="text-sm text-mute">{answered.card.a}</p>
                  {answered.card.code && <CodeBlock key={answered.card.id} code={answered.card.code} lang={answered.card.lang || SUBJECT_LANG[answered.card.subject]} />}
                  <Button onClick={nextQuiz}>Next question<ChevronRight size={16} aria-hidden="true" /></Button>
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold"><Target size={16} className="text-accent" aria-hidden="true" />Daily goal</h2>
              <span className="flex items-center gap-1 text-sm text-mute"><Flame size={15} className={streak.current ? 'text-warn' : ''} aria-hidden="true" />{streak.current} day streak</span>
            </div>
            <ProgressBar value={(Math.min(todayCount, goal) / goal) * 100} tone={todayCount >= goal ? 'ok' : 'accent'} label="Daily flashcard goal" />
            <p className="text-sm text-mute">{todayCount >= goal ? `Goal reached today: ${todayCount} cards. Today counts for your streak.` : `${todayCount} of ${goal} cards today. Each card you mark counts toward your streak.`}</p>
            <Select label="Cards per day" value={String(goal)} onChange={(e) => setDaily({ ...daily, date: today, count: todayCount, goal: Number(e.target.value), reached: todayCount >= Number(e.target.value) })} options={['5', '10', '20', '30', '50']} />
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold">{subject} progress</h2>
            <ProgressBar value={pct} tone="ok" label={`${subject} flashcard progress`} />
            <dl className="grid grid-cols-4 gap-2 text-center">
              {[['Total', subjectCards.length], ['Known', known], ['Revise', revise], ['Due', dueCount]].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-surface2 py-3"><dt className="text-xs text-mute">{l}</dt><dd className="text-lg font-semibold">{v}</dd></div>
              ))}
            </dl>
            <p className="text-sm text-mute">{pct}% of {subject} known. All subjects: {overallKnown} of {allFlashcards.length}. Revision cards return tomorrow, then after 3 days, then weekly.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
