import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper, Lock, ExternalLink } from 'lucide-react';
import { PageHeader } from '../../components/common';
import { Badge, Card, ProgressBar } from '../../components/ui';
import { ProgressRing } from '../../components/charts';
import useProgress from '../../hooks/useProgress';
import useLocalStorage from '../../hooks/useLocalStorage';
import { KEYS } from '../../utils/localStorage';
import { logActivity } from '../../utils/activity';
import { useToast } from '../../context/ToastContext';
import { cx } from '../../utils/cx';

const MILESTONES = [
  { at: 25, label: 'Getting started', message: 'Great start! Keep the momentum going. 💪' },
  { at: 50, label: 'Halfway there', message: 'Halfway there! Great Job! 👏' },
  { at: 75, label: 'Almost ready', message: 'Almost there! Keep it up! 🚀' },
  { at: 100, label: 'Placement ready', message: 'Superb! Great Job! Keep it up! 🎉' },
];

export default function Readiness() {
  const p = useProgress();
  const { toast } = useToast();
  const [readiness, setReadiness] = useLocalStorage(KEYS.readiness, { manual: {}, celebrated: [] });
  const celebrated = readiness.celebrated || [];

  useEffect(() => {
    const reached = MILESTONES.filter((m) => p.readinessPct >= m.at && !celebrated.includes(m.at));
    if (!reached.length) return;
    toast(reached[reached.length - 1].message);
    setReadiness((cur) => ({ ...cur, celebrated: [...new Set([...(cur.celebrated || []), ...reached.map((m) => m.at)])] }));
  }, [p.readinessPct, celebrated, setReadiness, toast]);

  const toggle = (task) => {
    const next = !(readiness.manual || {})[task.id];
    setReadiness((cur) => ({ ...cur, manual: { ...(cur.manual || {}), [task.id]: next } }));
    if (next) logActivity('readiness', `Completed: ${task.label}`);
  };

  return (
    <>
      <PageHeader title="Placement Readiness" subtitle="Tasks marked Auto complete themselves from your real progress in other modules." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center gap-4 text-center">
          <ProgressRing value={p.readinessPct} size={150} label="Overall" />
          <p className="text-sm text-mute">{p.doneCount} of {p.tasks.length} tasks complete</p>
          <div className="w-full space-y-2 text-left">
            {MILESTONES.map((m) => (
              <div key={m.at} className={cx('flex items-center justify-between rounded-lg px-3 py-2 text-sm', p.readinessPct >= m.at ? 'bg-ok/10 text-ok' : 'bg-surface2 text-mute')}>
                <span className="flex items-center gap-2">{p.readinessPct >= m.at ? <PartyPopper size={15} aria-hidden="true" /> : <Lock size={15} aria-hidden="true" />}{m.label}</span>
                <span>{m.at}%</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {p.byCat.map((c) => {
            const tasks = p.tasks.filter((t) => t.cat === c.cat);
            return (
              <Card key={c.cat}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">{c.cat}</h2>
                  <span className="text-sm text-mute">{c.done}/{c.total}</span>
                </div>
                <ProgressBar value={c.pct} tone={c.pct === 100 ? 'ok' : 'accent'} label={`${c.cat} progress`} className="mb-3" />
                <ul>
                  {tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface2">
                      <input id={t.id} type="checkbox" checked={t.done} disabled={t.isAuto} onChange={() => toggle(t)} className="h-4 w-4 shrink-0 accent-[rgb(var(--accent))]" />
                      <label htmlFor={t.id} className={cx('flex-1 text-sm', t.done && 'text-mute line-through')}>{t.label}</label>
                      {t.isAuto && <Badge tone={t.done ? 'ok' : 'neutral'}>Auto</Badge>}
                      <Link to={t.to} aria-label={`Open ${t.label}`} className="text-mute hover:text-ink"><ExternalLink size={14} /></Link>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
