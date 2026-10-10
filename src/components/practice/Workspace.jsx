import { useRef, useState } from 'react';
import { ArrowLeft, Play, Send, RotateCcw, CheckCircle2, XCircle, Loader2, Trophy, ChevronRight, EyeOff } from 'lucide-react';
import { BookmarkButton, difficultyTone } from '../common';
import CodeEditor from '../common/CodeEditor';
import Timer from '../common/Timer';
import { Badge, Button, Card } from '../ui';
import useTimer from '../../hooks/useTimer';
import { runPython } from '../../services/pythonRunner';
import { logActivity } from '../../utils/activity';
import { formatTime } from '../../utils/timer';
import { useToast } from '../../context/ToastContext';
import { cx } from '../../utils/cx';

export default function Workspace({ item, config, progress, setProgress, onBack, onNext }) {
  const { toast } = useToast();
  const timer = useTimer();
  const startedAt = useRef(0);
  const [code, setCode] = useState(item.starter);
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [finishedIn, setFinishedIn] = useState(null);

  const visible = item.mode === 'calls' ? 2 : 3;
  const solvedRecord = (progress.solved || {})[item.id];
  const history = (Array.isArray(progress.attempts) ? progress.attempts : []).filter((a) => a.qid === item.id).slice(0, 5);

  const begin = () => {
    if (started) return;
    startedAt.current = Date.now();
    timer.start();
    setStarted(true);
  };
  const elapsed = () => Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));

  const record = (passed, total, solved, seconds) => {
    const now = new Date().toISOString();
    setProgress((cur) => {
      const attempts = [{ qid: item.id, title: item.title, passed, total, score: Math.round((passed / total) * 100), seconds, solved, at: now }, ...(Array.isArray(cur.attempts) ? cur.attempts : [])].slice(0, 300);
      const solvedMap = { ...(cur.solved && typeof cur.solved === 'object' ? cur.solved : {}) };
      if (solved) {
        const prev = solvedMap[item.id];
        solvedMap[item.id] = { seconds: prev ? Math.min(prev.seconds, seconds) : seconds, at: prev ? prev.at : now };
      }
      return { ...cur, attempts, solved: solvedMap };
    });
  };

  const execute = async (mode) => {
    if (busy) return;
    begin();
    setBusy(true);
    const res = await runPython({ code, mode: item.mode, fn: item.fn, tests: item.tests, entry: item.entry, testCode: item.testCode, limit: mode === 'run' ? visible : undefined });
    setBusy(false);
    if (!res || res.error || !Array.isArray(res.results)) {
      setOutcome({ mode, error: (res && res.error) || 'Something went wrong while running your code.' });
      return;
    }
    const passed = res.results.filter((r) => r.passed).length;
    const total = res.results.length;
    setOutcome({ mode, results: res.results, passed, total });
    if (mode !== 'submit') return;

    const solved = passed === total;
    const seconds = elapsed();
    if (solved) {
      timer.stop();
      setFinishedIn(seconds);
      logActivity(config.activity, `${config.kind === 'coding' ? 'Solved' : 'Fixed'}: ${item.title}`);
      toast(`All tests passed in ${formatTime(seconds)}`);
    }
    record(passed, total, solved, seconds);
  };

  const restart = () => {
    timer.reset();
    setStarted(false);
    setFinishedIn(null);
    setOutcome(null);
    setCode(item.starter);
  };

  const solved = Boolean(solvedRecord) || finishedIn !== null;
  const finished = finishedIn !== null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>All {config.pluralLabel}</Button>
        <div className="ml-auto flex items-center gap-2">
          <Timer seconds={timer.seconds} running={timer.running} />
          <BookmarkButton item={{ id: `${config.kind}:${item.id}`, type: config.kind, title: item.title, category: item.topic, path: `${config.route}?id=${item.id}` }} />
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold">{item.title}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.level && <Badge tone="accent">{item.level}</Badge>}
                <Badge>{item.topic}</Badge>
                <Badge tone={difficultyTone(item.difficulty)}>{item.difficulty}</Badge>
                {item.source === 'api' && <Badge>Live dataset</Badge>}
                {solved && <Badge tone="ok"><CheckCircle2 size={12} aria-hidden="true" />Solved{solvedRecord ? ` · best ${formatTime(solvedRecord.seconds)}` : ''}</Badge>}
              </div>
            </div>
            <div>
              <h2 className="mb-1 text-sm font-semibold">{config.statementLabel}</h2>
              {item.source === 'api' ? <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-line bg-bg p-3 font-mono text-xs leading-relaxed text-mute">{item.statement}</pre> : <p className="text-sm text-mute">{item.statement}</p>}
            </div>
            {item.examples && item.examples.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold">{config.kind === 'coding' ? 'Examples' : 'Expected behavior'}</h2>
                <div className="space-y-2">
                  {item.examples.map((ex) => (
                    <div key={ex.input} className="rounded-lg border border-line bg-bg p-3 font-mono text-xs">
                      <p><span className="text-mute">{config.kind === 'coding' ? 'Input: ' : 'Call: '}</span>{ex.input}</p>
                      <p><span className="text-mute">{config.kind === 'coding' ? 'Output: ' : 'Should return: '}</span>{ex.output}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {finished && (
            <Card className="space-y-3 border-ok/40 bg-ok/5">
              <p className="flex items-center gap-2 font-semibold text-ok"><Trophy size={18} aria-hidden="true" />Completed in {formatTime(finishedIn)}</p>
              {item.explanation && <div><h2 className="mb-1 text-sm font-semibold">What went wrong</h2><p className="whitespace-pre-wrap text-sm text-mute">{item.explanation}</p></div>}
              <div className="flex flex-wrap gap-2">
                {onNext && <Button onClick={onNext}>Next {config.singularLabel}<ChevronRight size={16} aria-hidden="true" /></Button>}
                <Button variant="secondary" icon={RotateCcw} onClick={restart}>Try again</Button>
              </div>
            </Card>
          )}

          <Card>
            <h2 className="mb-3 text-sm font-semibold">Attempt history</h2>
            {history.length === 0 ? <p className="text-sm text-mute">No attempts yet. Submit your solution to record one.</p> : (
              <ul className="divide-y divide-line">
                {history.map((a) => (
                  <li key={a.at} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span className="text-mute">{new Date(a.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-mute">{formatTime(a.seconds)}</span>
                      <Badge tone={a.solved ? 'ok' : 'warn'}>{a.passed}/{a.total} · {a.score}%</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3">
            <CodeEditor value={code} onChange={setCode} onRun={() => execute('run')} label={`${item.title} code editor`} />
            <div className="flex flex-wrap items-center gap-2">
              {!started && <Button variant="secondary" onClick={begin}>Start challenge</Button>}
              <Button variant="secondary" icon={busy ? Loader2 : Play} disabled={busy} onClick={() => execute('run')} className={busy ? '[&>svg]:animate-spin' : ''}>Run</Button>
              <Button icon={Send} disabled={busy} onClick={() => execute('submit')}>Submit</Button>
              <Button variant="ghost" icon={RotateCcw} onClick={() => setCode(item.starter)}>Reset code</Button>
            </div>
            <p className="text-xs text-mute">Run checks the first {visible} tests. Submit checks every test, saves the attempt and stops the timer when all pass. The timer starts on your first click. Editor tips: Tab indents, Ctrl+Space shows suggestions, Ctrl+Enter runs. Python runs in your browser, and the first run downloads the engine (about 10 MB).</p>
          </Card>

          {busy && <p className="flex items-center gap-2 text-sm text-mute" role="status"><Loader2 size={16} className="animate-spin" aria-hidden="true" />Running your code…</p>}

          {outcome && !busy && (
            <Card className="space-y-3">
              {outcome.error ? (
                <div role="alert">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-bad"><XCircle size={18} aria-hidden="true" />Your code could not run</p>
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-bg p-3 font-mono text-xs text-bad">{outcome.error}</pre>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{outcome.mode === 'run' ? 'Run results' : 'Submission'}</h2>
                    <Badge tone={outcome.passed === outcome.total ? 'ok' : 'warn'}>{outcome.passed}/{outcome.total} passed · {Math.round((outcome.passed / outcome.total) * 100)}%</Badge>
                  </div>
                  <ul className="space-y-2">
                    {outcome.results.map((r, i) => {
                      const hidden = i >= visible;
                      return (
                        <li key={i} className={cx('rounded-lg border p-3 text-xs', r.passed ? 'border-ok/30 bg-ok/5' : 'border-bad/30 bg-bad/5')}>
                          <p className="flex items-start gap-2 font-medium">
                            {r.passed ? <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ok" aria-hidden="true" /> : <XCircle size={14} className="mt-0.5 shrink-0 text-bad" aria-hidden="true" />}
                            <span className="break-all font-mono">{hidden ? <span className="inline-flex items-center gap-1 text-mute"><EyeOff size={12} aria-hidden="true" />Hidden test {i + 1}</span> : r.label}</span>
                          </p>
                          {!r.passed && !hidden && (
                            <div className="mt-2 space-y-0.5 pl-6 font-mono text-mute">
                              {r.expected !== undefined && <p>Expected: {r.expected}</p>}
                              {r.got !== undefined && r.got !== null && <p>Got: {r.got}</p>}
                              {r.error && <p className="text-bad">{r.error}</p>}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
