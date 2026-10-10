import { debuggingChallenges } from '../data/mockData';
import { difficultyFromSolution, fetchRows, str } from './datasetApi';

// Source: HumanEvalFix (bigcode/humanevalpack): real buggy Python solutions with unit tests.
// Deliberately a different dataset from the Coding Arena.
const SOURCE = { dataset: 'bigcode/humanevalpack', config: 'python', split: 'test' };

const sentence = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Bug fix');

export function normalizeHumanEvalFix(row) {
  const taskId = str(row.task_id);
  const entry = str(row.entry_point);
  const test = str(row.test);
  const buggy = str(row.buggy_solution);
  const head = str(row.declaration) || str(row.prompt);
  const prompt = str(row.prompt) || head;
  if (!taskId || !entry || !test || !buggy || !head) return null;
  const hasDef = new RegExp(`def\\s+${entry}\\s*\\(`).test(buggy);
  const imports = str(row.import);
  const code = hasDef ? buggy : `${imports ? `${imports}\n` : ''}${head}${buggy}`;
  const num = taskId.replace(/\D/g, '') || taskId;
  const symptom = str(row.failure_symptoms);
  return {
    id: `hef-${num}`,
    source: 'api',
    topic: sentence(str(row.bug_type)),
    difficulty: difficultyFromSolution(row.canonical_solution),
    title: `Fix ${entry.replace(/_/g, ' ')}`,
    statement: `The function ${entry} has a bug${symptom ? ` (${symptom})` : ''}. Fix it so it behaves as its docstring describes.\n\n${prompt}`,
    starter: `${code.replace(/\s+$/, '')}\n`,
    mode: 'asserts',
    entry,
    testCode: `${str(row.test_setup) ? `${row.test_setup}\n` : ''}${test}`,
    explanation: `Bug type: ${str(row.bug_type) || 'unknown'}.${str(row.canonical_solution) ? `\n\nA correct body for this function:\n${row.canonical_solution}` : ''}`,
  };
}

export async function loadDebuggingChallenges() {
  try {
    const rows = await fetchRows(SOURCE);
    const known = new Set(debuggingChallenges.map((q) => q.id));
    const remote = rows.map(normalizeHumanEvalFix).filter((q) => q && !known.has(q.id));
    if (remote.length === 0) throw new Error('No valid challenges in the response');
    return { questions: [...debuggingChallenges, ...remote], source: 'api', remoteCount: remote.length };
  } catch (err) {
    return { questions: debuggingChallenges, source: 'fallback', message: err.message || 'Network error' };
  }
}
