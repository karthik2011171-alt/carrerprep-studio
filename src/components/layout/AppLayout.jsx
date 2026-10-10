import { useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileMenu from './MobileMenu';
import ErrorBoundary from '../common/ErrorBoundary';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-bg lg:block"><Sidebar /></aside>
      <MobileMenu open={menuOpen} onClose={closeMenu} />
      <Header onMenu={() => setMenuOpen(true)} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ErrorBoundary key={pathname}>
          <div className="animate-fade-in"><Outlet /></div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
