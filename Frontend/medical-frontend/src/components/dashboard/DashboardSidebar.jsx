// src/components/dashboard/DashboardSidebar.jsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Menu entries per role. Every path is a real route under /dashboard.
const COMMON_TOP = [{ path: '/dashboard', icon: '🏠', label: 'Dashboard' }];

const MENU_BY_ROLE = {
  ROLE_USER: [
    { path: '/dashboard/appointments', icon: '📅', label: 'My Appointments' },
    { path: '/dashboard/make-appointment', icon: '➕', label: 'Book Appointment' }
  ],
  ROLE_DOCTOR: [
    { path: '/dashboard/appointments', icon: '📅', label: 'My Schedule' }
  ],
  ROLE_ADMIN: [
    { path: '/dashboard/appointments', icon: '📅', label: 'Appointments' },
    { path: '/dashboard/users', icon: '👥', label: 'Patients' },
    { path: '/dashboard/doctor-details', icon: '👨‍⚕️', label: 'Doctors' },
    { path: '/dashboard/admin-details', icon: '🛡️', label: 'Administrators' },
    { path: '/dashboard/add-doctor', icon: '➕', label: 'Add Doctor' },
    { path: '/dashboard/add-admin', icon: '➕', label: 'Add Admin' },
    { path: '/dashboard/messages', icon: '✉️', label: 'Messages' }
  ]
};

const COMMON_BOTTOM = [
  { path: '/dashboard/my-profile', icon: '👤', label: 'My Profile' }
];

const ROLE_TITLES = {
  ROLE_ADMIN: 'Admin Console',
  ROLE_DOCTOR: 'Doctor Portal',
  ROLE_USER: 'Patient Portal',
  ROLE_PATIENT: 'Patient Portal'
};

/**
 * Always visible from the md breakpoint up. On phones it is an off-canvas drawer: `open` slides it in
 * over a dimmed backdrop and `onClose` is called when the backdrop or close button is tapped.
 */
const DashboardSidebar = ({ open = false, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const roleKey = user?.role === 'ROLE_PATIENT' ? 'ROLE_USER' : user?.role;
  const items = [...COMMON_TOP, ...(MENU_BY_ROLE[roleKey] || []), ...COMMON_BOTTOM];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
    {/* Backdrop behind the drawer on phones */}
    {open && (
      <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} aria-hidden="true" />
    )}
    <aside
      className={`bg-slate-900 h-screen w-64 flex flex-col text-white fixed left-0 top-0 z-40 transform transition-transform duration-200 md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Dashboard navigation"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0 relative">
        <button
          type="button"
          onClick={onClose}
          className="md:hidden absolute right-4 top-4 rounded-lg px-2 py-1 text-slate-300 hover:bg-slate-800"
          aria-label="Close menu"
        >
          ✕
        </button>
        <Link to="/" className="text-lg font-bold">Remedic</Link>
        <h2 className="text-lg font-semibold">{ROLE_TITLES[user?.role] || 'Medical Dashboard'}</h2>
        <p className="text-sm text-slate-400"><span>👤</span> {user?.role?.replace('ROLE_', '') || 'User'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="ml-3">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Sign Out
        </button>
      </div>
    </aside>
    </>
  );
};

export default DashboardSidebar;
