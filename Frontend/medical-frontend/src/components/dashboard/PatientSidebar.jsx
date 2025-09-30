// src/components/dashboard/PatientSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PatientSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const patientMenuItems = [
    { path: '/patient-dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/my-appointments', icon: '📅', label: 'My Appointments' },
    { path: '/my-records', icon: '📋', label: 'Medical Records' },
    { path: '/my-medications', icon: '💊', label: 'Medications' },
    { path: '/test-results', icon: '🔬', label: 'Test Results' },
    { path: '/messages', icon: '💬', label: 'Messages' },
    { path: '/billing', icon: '💳', label: 'Bills & Payments' },
    { path: '/health-profile', icon: '👤', label: 'Health Profile' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="bg-slate-900 h-full min-h-screen w-64 flex flex-col text-white fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <p className="text-lg font-bold">Remedic</p>
        <h2 className="text-lg font-semibold">Patient Portal</h2>
        <p className="text-sm text-slate-400">
          <span>👤</span> {user?.firstName || 'Patient'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {patientMenuItems.map((item) => (
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

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-3 px-4">QUICK ACTIONS</p>
          <ul className="space-y-2">
            <li>
              <button className="w-full flex items-center px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <span className="text-sm">📞</span>
                <span className="ml-3">Emergency Call</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <span className="text-sm">🚑</span>
                <span className="ml-3">Request Ambulance</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">
              Patient ID: {user?.id || 'P001'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default PatientSidebar;