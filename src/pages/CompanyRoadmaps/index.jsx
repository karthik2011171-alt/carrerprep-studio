import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { PageHeader, BookmarkButton } from '../../components/common';
import { Badge, Card, ProgressBar, Tabs } from '../../components/ui';
import { companyRoadmaps } from '../../data/companyRoadmaps';
import useLocalStorage from '../../hooks/useLocalStorage';
import { KEYS } from '../../utils/localStorage';
import { logActivity } from '../../utils/activity';
import { cx } from '../../utils/cx';

const CHIP_SECTIONS = [
  ['focus', 'Common focus areas'], ['technical', 'Technical topics'], ['aptitude', 'Aptitude preparation'],
  ['hr', 'HR preparation'], ['projects', 'Project preparation'], ['skills', 'Skill requirements'],
];

export default function CompanyRoadmaps() {
  const [params] = useSearchParams();
  const initial = companyRoadmaps.some((c) => c.id === params.get('c')) ? params.get('c') : companyRoadmaps[0].id;
  const [activeId, setActiveId] = useState(initial);
  const [progress, setProgress] = useLocalStorage(KEYS.company, {});
  const co = companyRoadmaps.find((c) => c.id === activeId) || companyRoadmaps[0];
  const checked = progress[co.id] || {};
  const done = co.checklist.filter((_, i) => checked[i]).length;

  const toggle = (i) => {
    const next = !checked[i];
    setProgress((cur) => ({ ...cur, [co.id]: { ...(cur[co.id] || {}), [i]: next } }));
    if (next) logActivity('company', `${co.name}: ${co.checklist[i]}`);
  };

  return (
    <>
      <PageHeader title="Company Roadmaps" subtitle="Typical, common preparation patterns for popular hiring routes." />
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-warn/30 bg-warn/5 p-3 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
        <p className="text-mute">These describe common patterns, not a guaranteed current process. Companies change rounds often, so confirm details on the official careers page.</p>
      </div>
      <Tabs className="mb-5" value={activeId} onChange={setActiveId} tabs={companyRoadmaps.map((c) => ({ id: c.id, label: c.name }))} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-xl font-semibold">{co.name}</h2><p className="text-sm text-accent">{co.tagline}</p></div>
              <BookmarkButton item={{ id: `company:${co.id}`, type: 'company', title: `${co.name} roadmap`, category: 'Company', path: `/company-roadmaps?c=${co.id}` }} />
            </div>
            <p className="mt-3 text-sm text-mute">{co.overview}</p>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold">Typical hiring stages</h3>
            <ol className="space-y-4">
              {co.stages.map((s, i) => (
                <li key={s.name} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{i + 1}</span>
                  <div><p className="font-medium">{s.name}</p><p className="text-sm text-mute">{s.detail}</p></div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="space-y-5">
            {CHIP_SECTIONS.map(([key, title]) => (
              <div key={key}>
                <h3 className="mb-2 text-sm font-semibold">{title}</h3>
                <div className="flex flex-wrap gap-1.5">{co[key].map((t) => <Badge key={t}>{t}</Badge>)}</div>
              </div>
            ))}
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="mb-2 font-semibold">Preparation strategy</h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-mute">{co.strategy.map((t) => <li key={t}>{t}</li>)}</ul>
            </Card>
            <Card>
              <h3 className="mb-2 font-semibold">Recommended study sequence</h3>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-mute">{co.sequence.map((t) => <li key={t}>{t}</li>)}</ol>
            </Card>
          </div>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <h3 className="font-semibold">Preparation checklist</h3>
          <p className="mb-3 text-sm text-mute">{done} of {co.checklist.length} complete</p>
          <ProgressBar value={(done / co.checklist.length) * 100} label={`${co.name} checklist progress`} className="mb-4" />
          <ul className="space-y-1">
            {co.checklist.map((item, i) => (
              <li key={item}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 text-sm hover:bg-surface2">
                  <input type="checkbox" checked={Boolean(checked[i])} onChange={() => toggle(i)} className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]" />
                  <span className={cx(checked[i] && 'text-mute line-through')}>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
