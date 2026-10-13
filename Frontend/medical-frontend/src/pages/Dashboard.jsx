// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Logo from '../components/common/Logo';

/**
 * Shell for every signed-in screen: a role-aware sidebar and the current page. On wide screens the
 * sidebar is always visible; on phones it slides in from a menu button. Which home page shows is
 * decided in DashboardHome, based on the user's role.
 */
const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the phone menu after navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Phone top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Logo to="/dashboard" />
        <button type="button" onClick={() => setMenuOpen(true)} className="btn-ghost px-2" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <DashboardSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="overflow-x-hidden px-4 py-6 md:ml-64 md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
