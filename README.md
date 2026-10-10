# CareerPrep Studio

Frontend-only React app for placement preparation. No backend, no database; all data is stored in your browser (localStorage).

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build in dist/
```

## Stack
React 18, React Router 6, Tailwind CSS 3, Lucide icons, Vite, and CodeMirror 6 (VS Code-style editor and code highlighting).

## Structure
```
src/
  components/  ui (Button, Card, Modal…), common, layout, charts, practice (shared coding/debugging UI)
  pages/       one folder per module
  data/        codingQuestions.js, mockData.js (debugging), interviewQuestions.js + interviewQuestionsExtra.js (175 questions, 25 per category),
               flashcards*.js (9 subjects x 50 cards: React, HTML, CSS, JavaScript, Python, SQL, Django, Node.js, Project Concepts),
               companyRoadmaps.js, mockInterviewQuestions.js, resumeTemplates.js, readinessTasks.js
  services/    codingApi.js, debuggingApi.js, datasetApi.js, pythonRunner.js
  hooks/       useLocalStorage, useTimer, useMediaRecorder, useBookmarks, useProgress, useSettings
  utils/       localStorage (all keys), activity (streak), atsScore, resumeModel, timer
```

## How things work
- **Python runs in the browser** via Pyodide in a Web Worker (loaded from the jsDelivr CDN on first use, then cached). Runs are stopped after 10 seconds.
- **Coding / Debugging data**: built-in sets (50 each) plus live problems from free Hugging Face datasets (HumanEval, HumanEvalFix). If the network fails, the built-in set is used automatically.
- **Add more questions**: append objects to `src/data/codingQuestions.js` or `src/data/mockData.js`. A `calls` item needs `fn` and `tests: [{input: [args], expected}]`. No UI changes are needed.
- **Streak rule**: a day is active when at least one activity is logged (dates stored as local `YYYY-MM-DD`).
- **ATS score** is a transparent heuristic, not a real ATS engine.
- **Resume PDF**: use the Save as PDF button, then pick "Save as PDF" in the print dialog.
- **Mock interview** recordings stay in memory for the session. Only your self-review is stored.

## Manual test checklist
1. Every sidebar link opens; `/nope` redirects to the 404 page.
2. Resume: fill steps, switch templates, refresh (data restored), Save as PDF, Reset.
3. Coding: open a problem, Run, Submit a correct solution (timer stops, appears as solved).
4. Debugging: fix a challenge, Submit, read the explanation.
5. Mock interview: allow camera, record, play back, save review. Also try denying permission.
6. Flashcards, interview bank, bookmarks → My Revision, readiness checklist, streak page.
7. Settings: export JSON, each reset shows a confirmation.
8. Resize to phone width: sidebar becomes a drawer; resume has Edit/Preview toggle.

## Flashcard features
Study and Quiz modes, shuffle, revise-only, spaced repetition (revision cards return tomorrow, then after 3 days, then weekly), syntax-highlighted code, and a daily goal linked to the streak. To add cards, append rows to the arrays in `src/data/flashcards*.js`.
