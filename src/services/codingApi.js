import { codingQuestions } from '../data/codingQuestions';
import { difficultyFromSolution, fetchRows, str } from './datasetApi';

// Source: OpenAI HumanEval (164 Python problems with unit tests) via the Hugging Face datasets-server.
const SOURCE = { dataset: 'openai/openai_humaneval', config: 'openai_humaneval', split: 'test' };

export function normalizeHumanEval(row) {
  const taskId = str(row.task_id);
  const prompt = str(row.prompt);
  const test = str(row.test);
  const entry = str(row.entry_point);
  if (!taskId || !prompt || !test || !entry) return null;
  const num = taskId.replace(/\D/g, '') || taskId;
  return {
    id: `he-${num}`,
    source: 'api',
    level: 'Advanced',
    topic: 'HumanEval',
    difficulty: difficultyFromSolution(row.canonical_solution),
    title: entry.replace(/_/g, ' '),
    statement: prompt,
    starter: `${prompt.replace(/\s+$/, '')}\n    pass\n`,
    mode: 'asserts',
    entry,
    testCode: test,
  };
}

// Never throws. Always resolves with usable questions (live ones appended to the local set).
export async function loadCodingQuestions() {
  try {
    const rows = await fetchRows(SOURCE);
    const known = new Set(codingQuestions.map((q) => q.id));
    const remote = rows.map(normalizeHumanEval).filter((q) => q && !known.has(q.id));
    if (remote.length === 0) throw new Error('No valid problems in the response');
    return { questions: [...codingQuestions, ...remote], source: 'api', remoteCount: remote.length };
  } catch (err) {
    return { questions: codingQuestions, source: 'fallback', message: err.message || 'Network error' };
  }
}
