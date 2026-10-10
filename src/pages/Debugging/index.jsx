import PracticeModule from '../../components/practice/PracticeModule';
import { loadDebuggingChallenges } from '../../services/debuggingApi';
import { debuggingChallenges } from '../../data/mockData';
import { KEYS } from '../../utils/localStorage';

const config = {
  kind: 'debugging',
  title: 'Debugging Challenge',
  subtitle: 'Each program is broken. Find the bug, fix the code and submit it against the test cases.',
  progressKey: KEYS.debugging,
  activity: 'debugging',
  route: '/debugging',
  loader: loadDebuggingChallenges,
  fallback: debuggingChallenges,
  sourceName: 'HumanEvalFix (Hugging Face)',
  topicLabel: 'Bug category',
  hasLevels: false,
  singularLabel: 'challenge',
  pluralLabel: 'challenges',
  solvedWord: 'fixed',
  statementLabel: 'Problem description',
};

export default function Debugging() {
  return <PracticeModule config={config} />;
}
