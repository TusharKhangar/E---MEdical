// src/components/dashboard/DashboardSidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardSidebar = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-slate-900 h-full min-h-screen w-64 flex flex-col text-white fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
          <p className="text-lg">Remedic</p>
        <h2 className="text-lg font-semibold">Medical Dashboard</h2>
        <p className="text-sm text-slate-400"><span>👤</span>{user?.role?.replace('ROLE_', '') || 'User'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-sm">🏠</span>
              <span className="ml-3">Dashboard</span>
            </Link>
          </li>

          <li>
            <Link
              to="/dashboard/my-tasks"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard/my-tasks')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-sm">📋</span>
              <span className="ml-3">My Tasks</span>
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
            </Link>
          </li>

          <li>
            <Link
              to="/dashboard/overview"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard/overview')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-sm">📊</span>
              <span className="ml-3">Overview</span>
            </Link>
          </li>

          <li>
            <Link
              to="/dashboard/messages"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard/messages')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-sm">💬</span>
              <span className="ml-3">Messages</span>
            </Link>
          </li>

          {/* Admin Only Items */}
          {isAdmin() && (
            <>
              <li>
                <Link
                  to="/dashboard/users"
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard/users')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm">👥</span>
                  <span className="ml-3">Team Members</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard/add-doctor"
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard/add-doctor')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm">👨‍⚕️</span>
                  <span className="ml-3">Add Doctor</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard/add-admin"
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard/add-admin')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm">🛡️</span>
                  <span className="ml-3">Add Admin</span>
                </Link>
              </li>
            </>
          )}

          <li>
            <Link
              to="/dashboard/calendar"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard/calendar')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-sm">📅</span>
              <span className="ml-3">Calendar</span>
            </Link>
          </li>

          <li>
            <Link
              to="/dashboard/settings"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard/settings')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-sm">⚙️</span>
              <span className="ml-3">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName || user?.email || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;