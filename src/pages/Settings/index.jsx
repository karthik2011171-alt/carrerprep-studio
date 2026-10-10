import { useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '../../components/common';
import { Button, Card, ConfirmModal, Input, Select } from '../../components/ui';
import useSettings from '../../hooks/useSettings';
import { KEYS, exportAll, remove } from '../../utils/localStorage';
import { useToast } from '../../context/ToastContext';

const PROGRESS_KEYS = [KEYS.coding, KEYS.debugging, KEYS.flashcards, KEYS.flashcardSrs, KEYS.flashcardDaily, KEYS.questions, KEYS.readiness, KEYS.company, KEYS.interviews];

const ACTIONS = [
  { id: 'progress', label: 'Reset progress', desc: 'Coding, debugging, flashcards, reviewed questions, checklists and interview history.', keys: PROGRESS_KEYS },
  { id: 'resume', label: 'Clear resume data', desc: 'Removes your saved resume and its ATS score.', keys: [KEYS.resume] },
  { id: 'bookmarks', label: 'Clear bookmarks', desc: 'Removes everything from My Revision.', keys: [KEYS.bookmarks] },
  { id: 'activity', label: 'Clear activity history', desc: 'Removes the activity log and resets your streak.', keys: [KEYS.activity, KEYS.streak] },
  { id: 'all', label: 'Reset entire application', desc: 'Deletes all saved data, including notes and settings.', keys: Object.values(KEYS) },
];

export default function Settings() {
  const [settings, update] = useSettings();
  const [pending, setPending] = useState(null);
  const { toast } = useToast();

  const exportData = () => {
    try {
      const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'careerprep-data.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('Data exported');
    } catch {
      toast('Export failed in this browser', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Everything is stored in this browser only." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-semibold">Profile & appearance</h2>
          <Input label="Your name" value={settings.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Asha" />
          <Select label="Stage" value={settings.role} onChange={(e) => update({ role: e.target.value })} options={['Student', 'Fresher', 'Career switcher', 'Experienced']} />
          <Select label="Theme" value={settings.theme} onChange={(e) => update({ theme: e.target.value })} options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'system', label: 'Match system' }]} />
        </Card>
        <Card className="space-y-4">
          <h2 className="font-semibold">Your data</h2>
          <p className="text-sm text-mute">Download a JSON backup of everything saved in this browser.</p>
          <Button variant="secondary" icon={Download} onClick={exportData}>Export data as JSON</Button>
        </Card>
        <Card className="space-y-1 lg:col-span-2">
          <h2 className="mb-2 font-semibold">Danger zone</h2>
          {ACTIONS.map((a) => (
            <div key={a.id} className="flex flex-col gap-2 border-t border-line py-3 first:border-0 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-medium">{a.label}</p><p className="text-sm text-mute">{a.desc}</p></div>
              <Button variant="danger" size="sm" onClick={() => setPending(a)}>{a.label}</Button>
            </div>
          ))}
        </Card>
      </div>
      <ConfirmModal
        open={Boolean(pending)}
        title={pending ? pending.label : ''}
        message={pending ? `${pending.desc} This cannot be undone.` : ''}
        confirmLabel="Yes, delete"
        onClose={() => setPending(null)}
        onConfirm={() => { pending.keys.forEach(remove); toast(`${pending.label} complete`, 'info'); }}
      />
    </>
  );
}
