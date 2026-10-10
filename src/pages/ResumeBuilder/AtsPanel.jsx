import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { Card, ProgressBar } from '../../components/ui';
import { ProgressRing } from '../../components/charts';

export default function AtsPanel({ ats }) {
  const tone = ats.score >= 75 ? 'ok' : ats.score >= 50 ? 'warn' : 'bad';
  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-5">
        <ProgressRing value={ats.score} size={104} stroke={9} label="ATS" />
        <div>
          <h3 className="font-semibold">ATS-readiness estimate</h3>
          <p className="text-sm text-mute">A simple checklist-style score, not a real ATS engine. Use it as a guide for what recruiters' software tends to look for.</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {ats.items.map((i) => (
          <div key={i.label}>
            <div className="mb-1 flex justify-between text-xs text-mute"><span>{i.label}</span><span>{i.earned}/{i.max}</span></div>
            <ProgressBar value={(i.earned / i.max) * 100} tone={i.earned === i.max ? 'ok' : tone === 'bad' ? 'warn' : 'accent'} label={i.label} className="h-1.5" />
          </div>
        ))}
      </div>
      {ats.strengths.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ok"><CheckCircle2 size={16} aria-hidden="true" />Strengths</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-mute">{ats.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      )}
      {ats.missing.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-warn"><AlertCircle size={16} aria-hidden="true" />Missing</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-mute">{ats.missing.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      )}
      {ats.suggestions.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-accent"><Lightbulb size={16} aria-hidden="true" />Suggestions</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-mute">{ats.suggestions.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      )}
    </Card>
  );
}
