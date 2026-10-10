import { useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
import { KEYS } from '../utils/localStorage';
import { computeStreak } from '../utils/activity';
import { allFlashcards, flashcards } from '../data/flashcards';
import { interviewQuestions } from '../data/interviewQuestions';
import { readinessTasks, READINESS_CATEGORIES } from '../data/readinessTasks';

const TARGET_SOLVED = 20; // solved problems that count as 100% for coding / debugging progress
const pct = (n, d) => (d > 0 ? Math.min(100, Math.round((n / d) * 100)) : 0);

// Progress record shapes used by modules:
// coding/debugging: { attempts: [{qid,title,passed,total,score,seconds,solved,at}], solved: { [qid]: {seconds, at} } }
// resume: { data, template, ats, updatedAt }
export default function useProgress() {
  const [coding] = useLocalStorage(KEYS.coding, { attempts: [], solved: {} });
  const [debugging] = useLocalStorage(KEYS.debugging, { attempts: [], solved: {} });
  const [flash] = useLocalStorage(KEYS.flashcards, {});
  const [reviewedMap] = useLocalStorage(KEYS.questions, {});
  const [resume] = useLocalStorage(KEYS.resume, {});
  const [readiness] = useLocalStorage(KEYS.readiness, { manual: {}, celebrated: [] });
  const [streakData] = useLocalStorage(KEYS.streak, { days: {} });
  const [interviews] = useLocalStorage(KEYS.interviews, []);
  const [company] = useLocalStorage(KEYS.company, {});

  return useMemo(() => {
    const codingSolved = Object.keys(coding.solved || {}).length;
    const debugSolved = Object.keys(debugging.solved || {}).length;
    const flashKnown = allFlashcards.filter((c) => flash[c.id] === 'known').length;
    const reactKnown = flashcards.filter((c) => flash[c.id] === 'known').length;
    const flashRevise = allFlashcards.filter((c) => flash[c.id] === 'revise').length;
    const reviewed = interviewQuestions.filter((x) => reviewedMap[x.id]).length;
    const companyChecked = Object.values(company).reduce((n, c) => n + Object.values(c || {}).filter(Boolean).length, 0);
    const ats = Number(resume.ats) || 0;

    const metrics = {
      codingSolved, debugSolved, flashKnown, flashTotal: allFlashcards.length, reactKnown, reactTotal: flashcards.length, reviewed, ats,
      resumeStarted: Boolean(resume.updatedAt), interviewsRecorded: interviews.length, companyChecked,
    };
    const manual = readiness.manual || {};
    const tasks = readinessTasks.map((t) => ({ ...t, isAuto: Boolean(t.auto), done: Boolean(manual[t.id]) || Boolean(t.auto && t.auto(metrics)) }));
    const byCat = READINESS_CATEGORIES.map((cat) => {
      const list = tasks.filter((t) => t.cat === cat);
      const done = list.filter((t) => t.done).length;
      return { cat, done, total: list.length, pct: pct(done, list.length) };
    });
    const doneCount = tasks.filter((t) => t.done).length;

    return {
      streak: computeStreak(streakData.days || {}),
      codingSolved, debugSolved, ats, reviewed, flashKnown, flashRevise,
      codingPct: pct(codingSolved, TARGET_SOLVED),
      debugPct: pct(debugSolved, TARGET_SOLVED),
      interviewPct: pct(reviewed, interviewQuestions.length),
      flashPct: pct(flashKnown, allFlashcards.length),
      codingPoints: codingSolved * 10,
      debugPoints: debugSolved * 10,
      codingAttempts: Array.isArray(coding.attempts) ? coding.attempts : [],
      interviewsRecorded: interviews.length,
      tasks, byCat, doneCount, readinessPct: pct(doneCount, tasks.length),
    };
  }, [coding, debugging, flash, reviewedMap, resume, readiness, streakData, interviews, company]);
}
