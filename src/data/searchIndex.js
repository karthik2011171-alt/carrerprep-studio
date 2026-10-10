import { interviewQuestions } from './interviewQuestions';
import { allFlashcards } from './flashcards';
import { companyRoadmaps } from './companyRoadmaps';
import { codingQuestions } from './codingQuestions';
import { debuggingChallenges } from './mockData';

export const makeEntry = (type, title, meta, path, extra = '') => ({
  type, title, meta, path, hay: `${title} ${meta} ${type} ${extra}`.toLowerCase(),
});

// Built-in datasets only. Challenges loaded live from the APIs are not part of global search.
export const staticIndex = [
  ...interviewQuestions.map((x) => makeEntry('Interview', x.question, x.category, `/interview-bank?q=${encodeURIComponent(x.question.slice(0, 40))}`, `${x.topic} ${x.answer}`)),
  ...allFlashcards.map((x) => makeEntry('Flashcard', x.q, `${x.subject} · ${x.topic}`, `/flashcards?card=${x.id}`, x.a)),
  ...codingQuestions.map((x) => makeEntry('Coding', x.title, `${x.level} · ${x.topic}`, `/coding?id=${x.id}`, x.statement)),
  ...debuggingChallenges.map((x) => makeEntry('Debugging', x.title, x.topic, `/debugging?id=${x.id}`, x.statement)),
  ...companyRoadmaps.map((x) => makeEntry('Roadmap', x.name, x.tagline, `/company-roadmaps?c=${x.id}`, x.overview)),
];
