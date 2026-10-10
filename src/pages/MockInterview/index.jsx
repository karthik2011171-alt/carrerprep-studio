import { useEffect, useRef, useState } from 'react';
import { Camera, Circle, Square, RotateCcw, Download, Star, Trash2, Video, ChevronRight, AlertTriangle, Lightbulb } from 'lucide-react';
import { PageHeader, EmptyState } from '../../components/common';
import { Badge, Button, Card, Tabs, Textarea } from '../../components/ui';
import useMediaRecorder from '../../hooks/useMediaRecorder';
import useTimer from '../../hooks/useTimer';
import useLocalStorage from '../../hooks/useLocalStorage';
import { KEYS } from '../../utils/localStorage';
import { logActivity } from '../../utils/activity';
import { formatTime } from '../../utils/timer';
import { mockQuestions, MOCK_CATEGORIES, SELF_REVIEW_CHECKS } from '../../data/mockInterviewQuestions';
import { useToast } from '../../context/ToastContext';
import { cx } from '../../utils/cx';

const BLANK_REVIEW = { rating: 0, checks: {}, notes: '' };

function LiveVideo({ stream }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay muted playsInline className="aspect-video w-full rounded-xl bg-black object-cover [transform:scaleX(-1)]" aria-label="Camera preview" />;
}

export default function MockInterview() {
  const rec = useMediaRecorder();
  const timer = useTimer();
  const { toast } = useToast();
  const [category, setCategory] = useState('HR');
  const [qIndex, setQIndex] = useState(0);
  const [history, setHistory] = useLocalStorage(KEYS.interviews, []);
  const [review, setReview] = useState(BLANK_REVIEW);
  const [seconds, setSeconds] = useState(0);

  const list = mockQuestions.filter((x) => x.category === category);
  const question = list[qIndex % list.length];
  const recording = rec.status === 'recording';

  const startRecording = () => {
    if (rec.start()) {
      timer.reset();
      timer.start();
    }
  };
  const stopRecording = () => {
    setSeconds(timer.stop());
    rec.stop();
  };
  const retake = async () => {
    timer.reset();
    setReview(BLANK_REVIEW);
    await rec.retake();
  };
  const saveReview = () => {
    const entry = { id: `${Date.now()}`, question: question.text, category, at: new Date().toISOString(), seconds, ...review };
    setHistory((cur) => [entry, ...cur].slice(0, 100));
    logActivity('interview', `Mock interview: ${question.text}`);
    toast('Attempt saved to your history');
    rec.discard();
    timer.reset();
    setReview(BLANK_REVIEW);
  };

  return (
    <>
      <PageHeader title="Mock Interview Studio" subtitle="Record yourself answering real questions, watch it back, then review your own performance." />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {rec.error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-bad/30 bg-bad/5 p-4 text-sm">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-bad" aria-hidden="true" />
              <div><p>{rec.error}</p>{rec.supported && <Button size="sm" variant="secondary" className="mt-3" onClick={rec.enable}>Try again</Button>}</div>
            </div>
          )}

          <Card className="space-y-4">
            {rec.status === 'recorded' ? (
              <video src={rec.url} controls playsInline className="aspect-video w-full rounded-xl bg-black" aria-label="Your recorded answer" />
            ) : rec.stream ? (
              <div className="relative">
                <LiveVideo stream={rec.stream} />
                {recording && <span className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-sm text-white"><Circle size={10} className="animate-pulse fill-red-500 text-red-500" aria-hidden="true" />REC {formatTime(timer.seconds)}</span>}
              </div>
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-surface2/40 p-6 text-center">
                <Camera size={32} className="text-mute" aria-hidden="true" />
                <p className="max-w-xs text-sm text-mute">{rec.status === 'requesting' ? 'Waiting for permission. Check your browser prompt…' : 'Turn on your camera and microphone to begin. Nothing is uploaded; recordings stay in your browser.'}</p>
                <Button icon={Video} disabled={rec.status === 'requesting'} onClick={rec.enable}>Enable camera & microphone</Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {rec.status === 'ready' && <Button icon={Circle} onClick={startRecording}>Start recording</Button>}
              {recording && <Button variant="danger" icon={Square} onClick={stopRecording}>Stop</Button>}
              {rec.status === 'recorded' && (
                <>
                  <Button variant="secondary" icon={RotateCcw} onClick={retake}>Retake</Button>
                  <a href={rec.url} download={`interview-${Date.now()}.${rec.ext}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface2 px-4 text-sm font-medium hover:border-mute/50"><Download size={16} aria-hidden="true" />Download</a>
                </>
              )}
              {rec.status === 'ready' && <Button variant="ghost" onClick={rec.discard}>Turn off camera</Button>}
            </div>
          </Card>

          {rec.status === 'recorded' && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Self-review</h2>
                <Badge>Length {formatTime(seconds)}</Badge>
              </div>
              <div>
                <p className="mb-2 text-sm text-mute">How did this answer go?</p>
                <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={review.rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setReview((r) => ({ ...r, rating: n }))} className="rounded p-1">
                      <Star size={24} className={n <= review.rating ? 'fill-warn text-warn' : 'text-mute'} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                {SELF_REVIEW_CHECKS.map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-surface2">
                    <input type="checkbox" checked={Boolean(review.checks[c])} onChange={(e) => setReview((r) => ({ ...r, checks: { ...r.checks, [c]: e.target.checked } }))} className="h-4 w-4 accent-[rgb(var(--accent))]" />{c}
                  </label>
                ))}
              </div>
              <Textarea label="What would you improve next time?" rows={3} value={review.notes} onChange={(e) => setReview((r) => ({ ...r, notes: e.target.value }))} />
              <Button onClick={saveReview}>Save attempt to history</Button>
              <p className="text-xs text-mute">History keeps your question, rating and notes. Video files are too large for browser storage, so download the recording first if you want to keep it.</p>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card className="space-y-4">
            <Tabs value={category} onChange={(c) => { setCategory(c); setQIndex(0); }} tabs={MOCK_CATEGORIES.map((c) => ({ id: c, label: c }))} />
            <div>
              <p className="mb-1 text-xs text-mute">Question {(qIndex % list.length) + 1} of {list.length}</p>
              <p className="text-lg font-semibold leading-snug">{question.text}</p>
            </div>
            <p className="flex items-start gap-2 rounded-lg bg-surface2 p-3 text-sm text-mute"><Lightbulb size={16} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />{question.tip}</p>
            <Button variant="secondary" disabled={recording} onClick={() => setQIndex((i) => (i + 1) % list.length)}>Next question<ChevronRight size={16} aria-hidden="true" /></Button>
          </Card>
        </div>
      </div>

      <h2 className="mb-3 mt-8 font-semibold">Interview history</h2>
      {history.length === 0 ? (
        <EmptyState icon={Video} title="No interview attempts yet" text="Record an answer and save your self-review to see it here." />
      ) : (
        <div className="space-y-3">
          {history.map((h) => (
            <Card key={h.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <p className="font-medium">{h.question}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="accent">{h.category}</Badge>
                  <Badge>{new Date(h.at).toLocaleDateString()}</Badge>
                  <Badge>{formatTime(h.seconds)}</Badge>
                  {h.rating > 0 && <Badge tone="warn"><Star size={12} className="fill-current" aria-hidden="true" />{h.rating}/5</Badge>}
                  <Badge className={cx(!Object.values(h.checks || {}).some(Boolean) && 'hidden')}>{Object.values(h.checks || {}).filter(Boolean).length}/{SELF_REVIEW_CHECKS.length} checks</Badge>
                </div>
                {h.notes && <p className="text-sm text-mute">{h.notes}</p>}
              </div>
              <button type="button" aria-label="Delete attempt" onClick={() => setHistory((cur) => cur.filter((x) => x.id !== h.id))} className="rounded-lg p-2 text-mute hover:bg-bad/10 hover:text-bad"><Trash2 size={16} /></button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
