import { Link } from 'react-router-dom';
import { Flame, Trophy, CalendarCheck, Zap } from 'lucide-react';
import { PageHeader, StatCard, EmptyState } from '../../components/common';
import { Card, ProgressBar, Button } from '../../components/ui';
import { BarChart } from '../../components/charts';
import useProgress from '../../hooks/useProgress';
import useLocalStorage from '../../hooks/useLocalStorage';
import { KEYS } from '../../utils/localStorage';
import { ACTIVITY_TYPES, dayKey, lastDays } from '../../utils/activity';
import { cx } from '../../utils/cx';

const heat = (n) => (n >= 4 ? 'bg-accent' : n >= 2 ? 'bg-accent/60' : n === 1 ? 'bg-accent/30' : 'bg-surface2');

export default function StreakDashboard() {
  const p = useProgress();
  const [activity] = useLocalStorage(KEYS.activity, []);
  const [streakData] = useLocalStorage(KEYS.streak, { days: {} });
  const days = streakData.days || {};
  const today = dayKey();
  const todays = activity.filter((a) => a.date === today);
  const week = lastDays(7).map((d) => ({ label: d.label, value: days[d.key] || 0 }));
  const month = lastDays(28);
  const byType = Object.keys(ACTIVITY_TYPES).map((t) => ({ type: t, count: activity.filter((a) => a.type === t).length }));
  const maxType = Math.max(1, ...byType.map((b) => b.count));

  return (
    <>
      <PageHeader title="Streak & Progress" subtitle="A day counts as active when you complete at least one preparation activity." />

      <Card className="hero mb-4 flex flex-col items-center gap-1 py-8 text-center">
        <Flame size={36} className={p.streak.current ? 'text-warn' : 'text-mute'} aria-hidden="true" />
        <p className="text-3xl font-semibold">Day {p.streak.current} Streak 🔥</p>
        <p className="text-sm text-mute">{p.streak.todayActive ? 'You have already practised today.' : p.streak.current ? 'Complete one activity today to keep it alive.' : 'Complete any activity to start your streak.'}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Trophy} tone="warn" label="Longest streak" value={`${p.streak.longest} days`} />
        <StatCard icon={CalendarCheck} label="Today" value={`${todays.length} activities`} />
        <StatCard icon={Zap} tone="ok" label="Coding score" value={`${p.codingPoints} pts`} hint="10 per solved problem" />
        <StatCard icon={Zap} tone="ok" label="Debugging score" value={`${p.debugPoints} pts`} hint="10 per fixed program" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">This week</h2>
          <BarChart data={week} />
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Last 28 days</h2>
          <div className="grid grid-cols-7 gap-1.5">
            {month.map((d) => <div key={d.key} title={`${d.key}: ${days[d.key] || 0}`} className={cx('aspect-square rounded-md', heat(days[d.key] || 0))} />)}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Overall activity</h2>
          <div className="space-y-3">
            {byType.map((b) => (
              <div key={b.type}>
                <div className="mb-1 flex justify-between text-sm"><span>{ACTIVITY_TYPES[b.type]}</span><span className="text-mute">{b.count}</span></div>
                <ProgressBar value={(b.count / maxType) * 100} label={ACTIVITY_TYPES[b.type]} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Preparation progress</h2>
          <div className="space-y-3">
            {[['Interview questions', p.interviewPct], ['Flashcards', p.flashPct], ['Coding', p.codingPct], ['Debugging', p.debugPct], ['Overall readiness', p.readinessPct]].map(([l, v]) => (
              <div key={l}>
                <div className="mb-1 flex justify-between text-sm"><span>{l}</span><span className="text-mute">{v}%</span></div>
                <ProgressBar value={v} label={l} tone={l === 'Overall readiness' ? 'ok' : 'accent'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <h2 className="mb-3 mt-6 font-semibold">Activity history</h2>
      {activity.length === 0 ? (
        <EmptyState icon={Flame} title="No activity yet" text="Review a flashcard or an interview question to log your first activity." action={<Link to="/flashcards"><Button>Revise flashcards</Button></Link>} />
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-line">
            {activity.slice(0, 15).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 truncate">{a.label}</span>
                <span className="shrink-0 text-xs text-mute">{ACTIVITY_TYPES[a.type] || a.type} · {a.date}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
