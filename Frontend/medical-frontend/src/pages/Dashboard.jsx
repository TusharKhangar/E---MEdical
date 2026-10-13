// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

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
    <div className="min-h-screen bg-gray-50">
      {/* Phone top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
        <span className="font-bold">Remedic</span>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </header>

      <DashboardSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="md:ml-64 p-4 md:p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
