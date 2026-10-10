import { Link } from 'react-router-dom';
import { FileText, Code2, Video, Bug, Layers, BookOpen, Flame, Target, ArrowRight } from 'lucide-react';
import { PageHeader, StatCard, EmptyState } from '../../components/common';
import { Card, Badge, ProgressBar, Button } from '../../components/ui';
import { ProgressRing } from '../../components/charts';
import useProgress from '../../hooks/useProgress';
import useSettings from '../../hooks/useSettings';
import useLocalStorage from '../../hooks/useLocalStorage';
import { KEYS } from '../../utils/localStorage';
import { ACTIVITY_TYPES } from '../../utils/activity';
import { formatTime } from '../../utils/timer';

const ACTIONS = [
  { to: '/resume', label: 'Build resume', icon: FileText },
  { to: '/coding', label: 'Practice coding', icon: Code2 },
  { to: '/mock-interview', label: 'Start mock interview', icon: Video },
  { to: '/debugging', label: 'Debug code', icon: Bug },
  { to: '/flashcards', label: 'Revise flashcards', icon: Layers },
  { to: '/interview-bank', label: 'View interview questions', icon: BookOpen },
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Dashboard() {
  const p = useProgress();
  const [settings] = useSettings();
  const [activity] = useLocalStorage(KEYS.activity, []);
  const upcoming = p.tasks.filter((t) => !t.done).slice(0, 4);
  const name = settings.name ? `, ${settings.name}` : '';

  const progressRows = [
    { label: 'Coding', value: p.codingPct, hint: `${p.codingSolved} solved` },
    { label: 'Debugging', value: p.debugPct, hint: `${p.debugSolved} fixed` },
    { label: 'Interview prep', value: p.interviewPct, hint: `${p.reviewed} reviewed` },
    { label: 'Flashcards', value: p.flashPct, hint: `${p.flashKnown} known` },
  ];

  return (
    <>
      <PageHeader title={`${greeting()}${name}`} subtitle="Here is where your placement preparation stands today." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="hero lg:col-span-2">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing value={p.readinessPct} size={140} label="Ready" />
            <div className="min-w-0 flex-1 space-y-3">
              {progressRows.map((r) => (
                <div key={r.label}>
                  <div className="mb-1 flex justify-between text-sm"><span>{r.label}</span><span className="text-mute">{r.hint}</span></div>
                  <ProgressBar value={r.value} label={`${r.label} progress`} />
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Quick actions</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {ACTIONS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-3 rounded-lg border border-line bg-surface2/50 px-3 py-2 text-sm transition hover:border-accent/50 hover:bg-surface2">
                <Icon size={16} className="text-accent" aria-hidden="true" />{label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flame} tone="warn" label="Current streak" value={`${p.streak.current} day${p.streak.current === 1 ? '' : 's'}`} hint={`Longest ${p.streak.longest}`} />
        <StatCard icon={FileText} label="Resume ATS score" value={p.ats ? `${p.ats}/100` : 'Not scored'} hint={p.ats ? 'Heuristic estimate' : 'Build your resume'} />
        <StatCard icon={Target} tone="ok" label="Readiness" value={`${p.doneCount}/${p.tasks.length} tasks`} hint={`${p.readinessPct}% complete`} />
        <StatCard icon={Video} label="Mock interviews" value={p.interviewsRecorded} hint="Recorded sessions" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-3 font-semibold">Up next</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-mute">Every readiness task is done. Nicely finished.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((t) => (
                <li key={t.id}>
                  <Link to={t.to} className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-surface2">
                    <span>{t.label}<span className="block text-xs text-mute">{t.cat}</span></span>
                    <ArrowRight size={14} className="text-mute transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Recent activity</h2>
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" text="Complete any practice task to start your streak." action={<Link to="/flashcards"><Button size="sm">Revise flashcards</Button></Link>} />
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span className="min-w-0"><span className="block truncate">{a.label}</span><span className="text-xs text-mute">{ACTIVITY_TYPES[a.type] || a.type} · {a.date}</span></span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Recent coding attempts</h2>
          {p.codingAttempts.length === 0 ? (
            <EmptyState title="Start your first coding challenge" action={<Link to="/coding"><Button size="sm">Open Coding Arena</Button></Link>} />
          ) : (
            <ul className="space-y-3">
              {p.codingAttempts.slice(0, 5).map((a, i) => (
                <li key={`${a.qid}-${i}`} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{a.title}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-mute">{formatTime(a.seconds)}</span>
                    <Badge tone={a.solved ? 'ok' : 'warn'}>{a.passed}/{a.total}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
