import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import ResumeBuilder from '../pages/ResumeBuilder';
import CodingArena from '../pages/CodingArena';
import MockInterview from '../pages/MockInterview';
import StreakDashboard from '../pages/StreakDashboard';
import InterviewBank from '../pages/InterviewBank';
import RevisionNotes from '../pages/RevisionNotes';
import CompanyRoadmaps from '../pages/CompanyRoadmaps';
import Debugging from '../pages/Debugging';
import Flashcards from '../pages/Flashcards';
import Readiness from '../pages/Readiness';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="resume" element={<ResumeBuilder />} />
        <Route path="coding" element={<CodingArena />} />
        <Route path="mock-interview" element={<MockInterview />} />
        <Route path="streak" element={<StreakDashboard />} />
        <Route path="interview-bank" element={<InterviewBank />} />
        <Route path="revision" element={<RevisionNotes />} />
        <Route path="company-roadmaps" element={<CompanyRoadmaps />} />
        <Route path="debugging" element={<Debugging />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="readiness" element={<Readiness />} />
        <Route path="settings" element={<Settings />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
