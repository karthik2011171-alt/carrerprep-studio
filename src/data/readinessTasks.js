// `auto(m)` tasks complete from real module data; others are manual checkboxes.
export const READINESS_CATEGORIES = ['Resume', 'Coding', 'Debugging', 'Interview', 'Flashcards', 'Company', 'Career assets'];

export const readinessTasks = [
  { id: 'resume-start', cat: 'Resume', label: 'Create your resume', to: '/resume', auto: (m) => m.resumeStarted },
  { id: 'resume-ats', cat: 'Resume', label: 'Reach an ATS score of 70+', to: '/resume', auto: (m) => m.ats >= 70 },
  { id: 'code-5', cat: 'Coding', label: 'Solve 5 Python problems', to: '/coding', auto: (m) => m.codingSolved >= 5 },
  { id: 'code-15', cat: 'Coding', label: 'Solve 15 Python problems', to: '/coding', auto: (m) => m.codingSolved >= 15 },
  { id: 'debug-5', cat: 'Debugging', label: 'Fix 5 broken programs', to: '/debugging', auto: (m) => m.debugSolved >= 5 },
  { id: 'debug-15', cat: 'Debugging', label: 'Fix 15 broken programs', to: '/debugging', auto: (m) => m.debugSolved >= 15 },
  { id: 'q-20', cat: 'Interview', label: 'Review 20 interview questions', to: '/interview-bank', auto: (m) => m.reviewed >= 20 },
  { id: 'mock-1', cat: 'Interview', label: 'Record a mock interview', to: '/mock-interview', auto: (m) => m.interviewsRecorded >= 1 },
  { id: 'hr-aloud', cat: 'Interview', label: 'Practise HR answers aloud', to: '/interview-bank' },
  { id: 'react-20', cat: 'Flashcards', label: 'Mark 20 flashcards as known', to: '/flashcards', auto: (m) => m.flashKnown >= 20 },
  { id: 'react-all', cat: 'Flashcards', label: 'Know every React flashcard', to: '/flashcards', auto: (m) => m.reactTotal > 0 && m.reactKnown >= m.reactTotal },
  { id: 'company-read', cat: 'Company', label: 'Start a company checklist', to: '/company-roadmaps', auto: (m) => m.companyChecked >= 1 },
  { id: 'company-pick', cat: 'Company', label: 'Choose your target companies', to: '/company-roadmaps' },
  { id: 'projects', cat: 'Career assets', label: 'Prepare explanations for 2 projects', to: '/interview-bank' },
  { id: 'github', cat: 'Career assets', label: 'Update your GitHub profile', to: '/readiness' },
  { id: 'portfolio', cat: 'Career assets', label: 'Prepare a portfolio or project links', to: '/readiness' },
  { id: 'final', cat: 'Career assets', label: 'Final interview readiness review', to: '/readiness' },
];
