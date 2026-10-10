// Runs Python in a Web Worker using Pyodide (WebAssembly). The worker has no access to the app's
// DOM, state or localStorage, and is terminated if the code runs too long.
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

const PY_SOURCE = String.raw`
import json, ast, copy, io, sys, traceback

def _norm(x):
    return json.loads(json.dumps(x, default=lambda o: sorted(o) if isinstance(o, (set, frozenset)) else repr(o)))

def _eq(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return isinstance(a, bool) and isinstance(b, bool) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) < 1e-6
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(_eq(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_eq(a[k], b[k]) for k in a)
    return a == b

def _err(e):
    return ''.join(traceback.format_exception_only(type(e), e)).strip()

def _short(s, n=120):
    s = str(s)
    return s if len(s) <= n else s[:n] + '...'

def _fail(msg):
    return json.dumps({'error': msg})

def _run_calls(p, ns):
    f = ns.get(p['fn'])
    if not callable(f):
        return _fail("Function '%s' was not found. Keep the function name unchanged." % p['fn'])
    out = []
    for t in p['tests'][:p.get('limit') or None]:
        args = copy.deepcopy(t['input'])
        label = '%s(%s)' % (p['fn'], ', '.join(repr(a) for a in args))
        expected = _short(repr(t['expected']))
        old = sys.stdout
        sys.stdout = io.StringIO()
        try:
            got = f(*args)
            out.append({'passed': _eq(_norm(got), t['expected']), 'label': label, 'expected': expected, 'got': _short(repr(got))})
        except BaseException as e:
            out.append({'passed': False, 'label': label, 'expected': expected, 'got': None, 'error': _short(_err(e))})
        finally:
            sys.stdout = old
    return json.dumps({'results': out})

def _run_asserts(p, ns):
    f = ns.get(p['entry'])
    if not callable(f):
        return _fail("Function '%s' was not found. Keep the function name unchanged." % p['entry'])
    src = p['testCode']
    try:
        tree = ast.parse(src)
    except SyntaxError as e:
        return _fail('The test suite could not be read: ' + _err(e))
    check, setup = None, []
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and node.name == 'check':
            check = node
        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Call) and getattr(node.value.func, 'id', '') == 'check':
            continue
        else:
            setup.append(node)
    if check is None:
        return _fail('The test suite has no check() function.')
    try:
        exec(compile(ast.Module(body=setup, type_ignores=[]), '<tests>', 'exec'), ns)
    except BaseException as e:
        return _fail('Test setup failed: ' + _short(_err(e)))
    ns[check.args.args[0].arg if check.args.args else 'candidate'] = f
    limit = p.get('limit')
    out, count = [], 0
    for st in check.body:
        is_test = any(isinstance(n, ast.Assert) for n in ast.walk(st))
        if is_test and limit and count >= limit:
            break
        code = compile(ast.Module(body=[st], type_ignores=[]), '<tests>', 'exec')
        if not is_test:
            try:
                exec(code, ns)
            except BaseException:
                pass
            continue
        count += 1
        label = _short((ast.get_source_segment(src, st) or '').strip().replace('\n', ' '), 110)
        old = sys.stdout
        sys.stdout = io.StringIO()
        try:
            exec(code, ns)
            out.append({'passed': True, 'label': label})
        except AssertionError:
            out.append({'passed': False, 'label': label, 'error': 'Assertion failed'})
        except BaseException as e:
            out.append({'passed': False, 'label': label, 'error': _short(_err(e))})
        finally:
            sys.stdout = old
    if not out:
        return _fail('No test cases were found for this challenge.')
    return json.dumps({'results': out})

def run_payload(raw):
    p = json.loads(raw)
    ns = {'__name__': 'solution'}
    old = sys.stdout
    sys.stdout = io.StringIO()
    try:
        exec(compile(p['code'], '<your code>', 'exec'), ns)
    except BaseException as e:
        return _fail(_err(e))
    finally:
        sys.stdout = old
    return _run_calls(p, ns) if p['mode'] == 'calls' else _run_asserts(p, ns)
`;

const WORKER_SOURCE = `
const PYODIDE = ${JSON.stringify(PYODIDE_URL)};
const PY_SOURCE = ${JSON.stringify(PY_SOURCE)};
let ready = null;
function boot() {
  if (!ready) {
    ready = (async () => {
      importScripts(PYODIDE + 'pyodide.js');
      const py = await loadPyodide({ indexURL: PYODIDE });
      py.runPython(PY_SOURCE);
      return py;
    })().catch((err) => { ready = null; throw err; });
  }
  return ready;
}
self.onmessage = async (e) => {
  const { id, type, payload } = e.data;
  try {
    const py = await boot();
    if (type === 'warm') { self.postMessage({ id, ok: true }); return; }
    py.globals.set('PAYLOAD', JSON.stringify(payload));
    const out = py.runPython('run_payload(PAYLOAD)');
    self.postMessage({ id, ok: true, result: JSON.parse(out) });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};
`;

let worker = null;
let seq = 0;
const pending = new Map();

function resetWorker() {
  if (worker) worker.terminate();
  worker = null;
}

function failAll(error) {
  pending.forEach((p) => {
    clearTimeout(p.timer);
    p.resolve({ ok: false, error });
  });
  pending.clear();
}

function ensureWorker() {
  if (worker) return worker;
  const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'application/javascript' }));
  worker = new Worker(url);
  worker.onmessage = (e) => {
    const { id, ...rest } = e.data;
    const p = pending.get(id);
    if (p) {
      pending.delete(id);
      clearTimeout(p.timer);
      p.resolve(rest);
    }
  };
  worker.onerror = () => {
    failAll('The Python engine stopped unexpectedly. Please try again.');
    resetWorker();
  };
  return worker;
}

function call(type, payload, timeoutMs) {
  return new Promise((resolve) => {
    let w;
    try {
      w = ensureWorker();
    } catch {
      resolve({ ok: false, error: 'Python execution is not supported in this browser.' });
      return;
    }
    const id = (seq += 1);
    const timer = setTimeout(() => {
      pending.delete(id);
      resetWorker();
      resolve({ ok: false, timeout: true, error: type === 'warm' ? 'The Python engine took too long to load.' : 'Time limit exceeded. Check your code for an infinite loop.' });
    }, timeoutMs);
    pending.set(id, { resolve, timer });
    w.postMessage({ id, type, payload });
  });
}

// Returns { error } or { results: [{passed, label, expected?, got?, error?}] }
export async function runPython(payload, { timeoutMs = 10000 } = {}) {
  const warm = await call('warm', null, 90000);
  if (!warm.ok) {
    return { error: warm.timeout ? warm.error : 'Could not load the Python engine. It needs an internet connection the first time you run code.' };
  }
  const res = await call('run', payload, timeoutMs);
  if (!res.ok) return { error: res.error || 'Execution failed.' };
  return res.result;
}
