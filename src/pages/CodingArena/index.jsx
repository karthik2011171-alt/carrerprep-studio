import PracticeModule from '../../components/practice/PracticeModule';
import { loadCodingQuestions } from '../../services/codingApi';
import { codingQuestions } from '../../data/codingQuestions';
import { KEYS } from '../../utils/localStorage';

const config = {
  kind: 'coding',
  title: 'Coding Arena',
  subtitle: 'Python practice from beginner basics to LeetCode-style problems. Write a function, run it, then submit against every test.',
  progressKey: KEYS.coding,
  activity: 'coding',
  route: '/coding',
  loader: loadCodingQuestions,
  fallback: codingQuestions,
  sourceName: 'OpenAI HumanEval (Hugging Face)',
  topicLabel: 'Topic',
  hasLevels: true,
  singularLabel: 'problem',
  pluralLabel: 'problems',
  solvedWord: 'solved',
  statementLabel: 'Problem',
};

export default function CodingArena() {
  return <PracticeModule config={config} />;
}
