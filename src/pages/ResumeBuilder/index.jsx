import { useMemo, useState } from 'react';
import { FileText, Printer, RotateCcw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { PageHeader, EmptyState } from '../../components/common';
import { Button, Card, ConfirmModal, ProgressBar, Tabs } from '../../components/ui';
import useLocalStorage from '../../hooks/useLocalStorage';
import { KEYS, remove } from '../../utils/localStorage';
import { logActivity } from '../../utils/activity';
import { computeAts } from '../../utils/atsScore';
import { normalize } from '../../utils/resumeModel';
import { useToast } from '../../context/ToastContext';
import { ResumePage, ScaledPage } from './ResumePreview';
import AtsPanel from './AtsPanel';
import { STEPS, PersonalStep, SummaryStep, SkillsStep, EntryStep, ExtraStep, TemplateStep } from './steps';
import { cx } from '../../utils/cx';

export default function ResumeBuilder() {
  const [resume, setResume] = useLocalStorage(KEYS.resume, {});
  const { toast } = useToast();
  const [started, setStarted] = useState(Boolean(resume.updatedAt));
  const [step, setStep] = useState(0);
  const [view, setView] = useState('edit');
  const [confirmReset, setConfirmReset] = useState(false);

  const data = useMemo(() => normalize(resume.data), [resume.data]);
  const template = resume.template || 'modern';
  const ats = useMemo(() => computeAts(data), [data]);

  // Every change is saved to localStorage immediately (auto-save).
  const commit = (patch) =>
    setResume((cur) => {
      const next = { ...normalize(cur.data), ...patch };
      return { ...cur, data: next, template: cur.template || 'modern', ats: computeAts(next).score, updatedAt: new Date().toISOString() };
    });
  const selectTemplate = (id) => setResume((cur) => ({ ...cur, data: normalize(cur.data), template: id, ats: cur.ats || 0, updatedAt: new Date().toISOString() }));

  const goTo = (i) => {
    if (i > step) logActivity('resume', `Updated resume: ${STEPS[step].label}`);
    setStep(i);
  };
  const print = () => {
    logActivity('resume', 'Exported resume as PDF');
    setView('preview');
    setTimeout(() => window.print(), 250);
  };
  const doReset = () => {
    remove(KEYS.resume);
    setStarted(false);
    setStep(0);
    toast('Resume cleared', 'info');
  };

  if (!started) {
    return (
      <>
        <PageHeader title="Resume Builder" subtitle="Build an ATS-friendly resume step by step with a live preview." />
        <EmptyState icon={FileText} title="No resume created yet" text="Answer a few guided steps, pick one of 10 templates and save it as a PDF. Your progress saves automatically." action={<Button onClick={() => { setStarted(true); logActivity('resume', 'Started a resume'); }}>Start building</Button>} />
      </>
    );
  }

  const id = STEPS[step].id;
  const body = {
    personal: <PersonalStep data={data} onChange={commit} />,
    summary: <SummaryStep data={data} onChange={commit} />,
    skills: <SkillsStep data={data} onChange={commit} />,
    education: <EntryStep section="education" data={data} onChange={commit} />,
    experience: <EntryStep section="experience" data={data} onChange={commit} />,
    projects: <EntryStep section="projects" data={data} onChange={commit} />,
    certifications: <EntryStep section="certifications" data={data} onChange={commit} />,
    extra: <ExtraStep data={data} onChange={commit} />,
    template: <TemplateStep template={template} onSelect={selectTemplate} />,
    final: (
      <div className="space-y-4 text-sm text-mute">
        <p>Your resume is ready. Use <b className="text-ink">Save as PDF</b> and choose “Save as PDF” as the destination in the print dialog. Turn off headers and footers for a clean page.</p>
        <Button icon={Printer} onClick={print}>Save as PDF</Button>
      </div>
    ),
  }[id];

  return (
    <>
      <PageHeader
        title="Resume Builder"
        subtitle={resume.updatedAt ? `Auto-saved ${new Date(resume.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Continue where you left off.` : 'Your progress saves automatically.'}
        actions={<><Button variant="secondary" icon={RotateCcw} onClick={() => setConfirmReset(true)}>Reset</Button><Button icon={Printer} onClick={print}>Save as PDF</Button></>}
      />

      <Tabs className="mb-4 xl:hidden" value={view} onChange={setView} tabs={[{ id: 'edit', label: 'Edit' }, { id: 'preview', label: 'Preview' }]} />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className={cx('space-y-4', view === 'edit' ? '' : 'hidden xl:block')}>
          <nav aria-label="Resume steps" className="flex gap-1.5 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <button key={s.id} type="button" onClick={() => goTo(i)} aria-current={i === step ? 'step' : undefined} className={cx('flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition', i === step ? 'border-accent bg-accent/10 text-accent' : 'border-line text-mute hover:text-ink')}>
                {i < step && <Check size={13} aria-hidden="true" />}{s.label}
              </button>
            ))}
          </nav>
          <ProgressBar value={((step + 1) / STEPS.length) * 100} label="Resume wizard progress" className="h-1.5" />

          <Card>
            <h2 className="mb-4 text-lg font-semibold">{STEPS[step].label}</h2>
            {body}
            <div className="mt-6 flex justify-between">
              <Button variant="secondary" icon={ChevronLeft} disabled={step === 0} onClick={() => goTo(step - 1)}>Back</Button>
              {step < STEPS.length - 1 ? <Button onClick={() => goTo(step + 1)}>Next<ChevronRight size={16} aria-hidden="true" /></Button> : <Button icon={Printer} onClick={print}>Save as PDF</Button>}
            </div>
          </Card>
          <AtsPanel ats={ats} />
        </div>

        <div className={cx('xl:sticky xl:top-24', view === 'preview' ? '' : 'hidden xl:block')}>
          <ScaledPage><ResumePage data={data} template={template} /></ScaledPage>
        </div>
      </div>

      <ConfirmModal open={confirmReset} title="Reset resume?" message="This deletes your saved resume data and ATS score. This cannot be undone." confirmLabel="Yes, reset" onClose={() => setConfirmReset(false)} onConfirm={doReset} />
    </>
  );
}
