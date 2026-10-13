// src/pages/Dashboard.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

/**
 * Shell for every signed-in screen: a role-aware sidebar on the left and the current page on
 * the right. Which home page shows is decided in DashboardHome, based on the user's role.
 */
const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
