// src/components/dashboard/DashboardSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3, CalendarClock, CalendarDays, CalendarPlus, History, Inbox, LayoutDashboard, LogOut, ShieldCheck,
  Stethoscope, UserCircle, UserPlus, Users, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import DoctorAvatar from '../common/DoctorAvatar';

// Menu sections per role. Every path is a real route under /dashboard.
const MENU_BY_ROLE = {
  ROLE_USER: [
    { items: [
      { path: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/dashboard/appointments', Icon: CalendarDays, label: 'My Appointments' },
      { path: '/dashboard/make-appointment', Icon: CalendarPlus, label: 'Book Appointment' },
    ] },
  ],
  ROLE_DOCTOR: [
    { items: [
      { path: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/dashboard/appointments', Icon: CalendarDays, label: 'My Schedule' },
      { path: '/dashboard/availability', Icon: CalendarClock, label: 'Working Hours' },
    ] },
  ],
  ROLE_ADMIN: [
    { items: [
      { path: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/dashboard/appointments', Icon: CalendarDays, label: 'Appointments' },
      { path: '/dashboard/analytics', Icon: BarChart3, label: 'Analytics' },
      { path: '/dashboard/messages', Icon: Inbox, label: 'Messages' },
    ] },
    { title: 'People', items: [
      { path: '/dashboard/users', Icon: Users, label: 'Patients' },
      { path: '/dashboard/doctor-details', Icon: Stethoscope, label: 'Doctors' },
      { path: '/dashboard/admin-details', Icon: ShieldCheck, label: 'Administrators' },
      { path: '/dashboard/add-doctor', Icon: UserPlus, label: 'Add Doctor' },
      { path: '/dashboard/add-admin', Icon: UserPlus, label: 'Add Admin' },
      { path: '/dashboard/audit', Icon: History, label: 'Audit log' },
    ] },
  ],
};

const ACCOUNT = { items: [{ path: '/dashboard/my-profile', Icon: UserCircle, label: 'My Profile' }] };

const ROLE_NAMES = { ROLE_ADMIN: 'Administrator', ROLE_DOCTOR: 'Doctor', ROLE_USER: 'Patient', ROLE_PATIENT: 'Patient' };

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

/**
 * Always visible from the md breakpoint up. On phones it is an off-canvas drawer: `open` slides it in
 * over a dimmed backdrop and `onClose` is called when the backdrop or close button is tapped.
 */
const DashboardSidebar = ({ open = false, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleKey = user?.role === 'ROLE_PATIENT' ? 'ROLE_USER' : user?.role;
  const sections = [...(MENU_BY_ROLE[roleKey] || []), { title: 'Account', ...ACCOUNT }];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Dashboard navigation"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <Logo to="/dashboard" />
          <button type="button" onClick={onClose} className="btn-ghost px-2 md:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {sections.map((section, i) => (
            <div key={section.title || i}>
              {section.title && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">{section.title}</p>
              )}
              <ul className="space-y-0.5">
                {section.items.map(({ path, Icon, label }) => (
                  <li key={path}>
                    <NavLink to={path} end={path === '/dashboard'} className={linkClass}>
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <DoctorAvatar doctor={user} size="h-9 w-9 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
              </p>
              <p className="truncate text-xs text-slate-600">{ROLE_NAMES[user?.role] || 'Signed in'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost mt-1 w-full justify-start px-3">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
