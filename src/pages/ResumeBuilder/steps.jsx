import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { TEMPLATES } from '../../data/resumeTemplates';
import { SAMPLE_RESUME } from '../../utils/resumeModel';
import { TemplateThumb } from './ResumePreview';
import { cx } from '../../utils/cx';

export const STEPS = [
  { id: 'personal', label: 'Personal info' }, { id: 'summary', label: 'Summary' }, { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' }, { id: 'experience', label: 'Experience' }, { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' }, { id: 'extra', label: 'Achievements' }, { id: 'template', label: 'Template' }, { id: 'final', label: 'Final preview' },
];

export const ENTRY_CONFIG = {
  education: { noun: 'education', fields: [['school', 'School / College'], ['degree', 'Degree'], ['field', 'Field of study'], ['grade', 'Grade / CGPA'], ['start', 'Start year'], ['end', 'End year']] },
  experience: { noun: 'experience', fields: [['role', 'Role'], ['company', 'Company'], ['location', 'Location'], ['start', 'Start (e.g. Jun 2025)'], ['end', 'End (blank = Present)'], ['description', 'What you did (one achievement per line)', 'area']] },
  projects: { noun: 'project', fields: [['name', 'Project name'], ['tech', 'Tech used'], ['link', 'Link (optional)'], ['description', 'Description (one point per line)', 'area']] },
  certifications: { noun: 'certification', fields: [['name', 'Certification'], ['issuer', 'Issued by'], ['year', 'Year']] },
};

export function PersonalStep({ data, onChange }) {
  const fields = [['name', 'Full name'], ['title', 'Target role / headline'], ['email', 'Email'], ['phone', 'Phone'], ['location', 'City, country'], ['linkedin', 'LinkedIn URL'], ['github', 'GitHub URL'], ['website', 'Portfolio URL']];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([key, label]) => (
        <Input key={key} label={label} value={data.personal[key] || ''} onChange={(e) => onChange({ personal: { ...data.personal, [key]: e.target.value } })} type={key === 'email' ? 'email' : 'text'} />
      ))}
    </div>
  );
}

export function SummaryStep({ data, onChange }) {
  const len = data.summary.length;
  return (
    <div>
      <Textarea label="Professional summary" rows={6} value={data.summary} onChange={(e) => onChange({ summary: e.target.value })} placeholder="Who you are, your strongest skills, and the role you want." />
      <p className={cx('mt-2 text-xs', len >= 150 ? 'text-ok' : 'text-mute')}>{len} characters. Aim for 150–400, written as 2–4 sentences.</p>
    </div>
  );
}

const SUGGESTED = ['Python', 'JavaScript', 'React', 'HTML', 'CSS', 'SQL', 'Git', 'REST APIs', 'Node.js', 'Tailwind CSS', 'Data Structures', 'Problem Solving'];

export function SkillsStep({ data, onChange }) {
  const [draft, setDraft] = useState('');
  const add = (value) => {
    const v = value.trim();
    if (!v || data.skills.some((s) => s.toLowerCase() === v.toLowerCase())) return;
    onChange({ skills: [...data.skills, v] });
    setDraft('');
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1"><Input label="Add a skill" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(draft); } }} placeholder="Type and press Enter" /></div>
        <Button className="mt-[26px]" icon={Plus} onClick={() => add(draft)}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Your skills">
        {data.skills.length === 0 && <p className="text-sm text-mute">No skills added yet.</p>}
        {data.skills.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 py-1 pl-3 pr-1.5 text-sm text-accent">
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange({ skills: data.skills.filter((x) => x !== s) })} className="rounded-full p-0.5 hover:bg-accent/20"><X size={14} /></button>
          </span>
        ))}
      </div>
      <div>
        <p className="mb-2 text-sm text-mute">Quick add</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.filter((s) => !data.skills.some((x) => x.toLowerCase() === s.toLowerCase())).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-line px-3 py-1 text-sm text-mute hover:border-accent hover:text-ink">+ {s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EntryStep({ section, data, onChange }) {
  const { noun, fields } = ENTRY_CONFIG[section];
  const items = data[section];
  const update = (i, key, value) => onChange({ [section]: items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)) });
  return (
    <div className="space-y-4">
      {items.length === 0 && <p className="text-sm text-mute">No {noun} entries yet. Add your first one below.</p>}
      {items.map((it, i) => (
        <Card key={i} className="bg-surface2/40">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium capitalize">{noun} {i + 1}</p>
            <button type="button" aria-label={`Delete ${noun} ${i + 1}`} onClick={() => onChange({ [section]: items.filter((_, idx) => idx !== i) })} className="rounded-lg p-1.5 text-mute hover:bg-bad/10 hover:text-bad"><Trash2 size={16} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map(([key, label, kind]) =>
              kind === 'area' ? (
                <Textarea key={key} className="sm:col-span-2" label={label} rows={4} value={it[key] || ''} onChange={(e) => update(i, key, e.target.value)} />
              ) : (
                <Input key={key} label={label} value={it[key] || ''} onChange={(e) => update(i, key, e.target.value)} />
              )
            )}
          </div>
        </Card>
      ))}
      <Button variant="secondary" icon={Plus} onClick={() => onChange({ [section]: [...items, {}] })}>Add {noun}</Button>
    </div>
  );
}

export function ExtraStep({ data, onChange }) {
  return <Textarea label="Achievements and additional information" rows={6} value={data.achievements} onChange={(e) => onChange({ achievements: e.target.value })} placeholder={'One per line, e.g.\nWon college hackathon 2025\nOpen-source contributor'} />;
}

export function TemplateStep({ template, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {TEMPLATES.map((t) => (
        <button key={t.id} type="button" aria-pressed={template === t.id} onClick={() => onSelect(t.id)} className={cx('flex flex-col items-center gap-2 rounded-xl border p-3 transition', template === t.id ? 'border-accent bg-accent/10' : 'border-line hover:border-mute/60')}>
          <TemplateThumb data={SAMPLE_RESUME} template={t.id} />
          <span className="text-sm font-medium">{t.name}</span>
        </button>
      ))}
    </div>
  );
}
