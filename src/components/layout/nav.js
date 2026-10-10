import { LayoutDashboard, FileText, Code2, Video, Flame, BookOpen, Bookmark, Building2, Bug, Layers, ClipboardCheck, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume', label: 'Resume Builder', icon: FileText },
  { to: '/coding', label: 'Coding Arena', icon: Code2 },
  { to: '/mock-interview', label: 'Mock Interview', icon: Video },
  { to: '/streak', label: 'Streak & Progress', icon: Flame },
  { to: '/interview-bank', label: 'Interview Question Bank', icon: BookOpen },
  { to: '/revision', label: 'My Revision', icon: Bookmark },
  { to: '/company-roadmaps', label: 'Company Roadmaps', icon: Building2 },
  { to: '/debugging', label: 'Debugging Challenge', icon: Bug },
  { to: '/flashcards', label: 'Flashcards', icon: Layers },
  { to: '/readiness', label: 'Placement Readiness', icon: ClipboardCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
];
