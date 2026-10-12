// Enhanced Role-Based Dashboard Router
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';

// Import your existing dashboard components
import PatientDashboard from '../dashboard/PatientDashboard';
// import DashboardHome from '../../components/dashboard/DashboardHome';
// import DashboardSidebar from '../../components/dashboard/DashboardSidebar';

// Create new role-specific dashboard components
import AdminDashboard from '../dashboard/AdminDashboard';
import DoctorDashboard from '../dashboard/DoctorDashboard';

const RoleBasedDashboard = () => {
  const { user, isAdmin, isDoctor, isPatient, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Role-based dashboard routing
  const renderDashboard = () => {
    if (isAdmin()) {
      return <AdminDashboard />;
    } else if (isDoctor()) {
      return <DoctorDashboard />;
    } else if (isPatient()) {
      return <PatientDashboard />;
    } else {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unknown Role</h2>
            <p className="text-gray-600">Your account role is not recognized. Please contact support.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Role-specific Sidebar */}
      <RoleBasedSidebar />
      
      {/* Main Dashboard Content */}
      <main className="flex-1 ml-64">
        {renderDashboard()}
      </main>
    </div>
  );
};

// Enhanced Role-Based Sidebar Component
const RoleBasedSidebar = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuth();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  // Role-specific navigation items
  const getNavigationItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/dashboard/profile', label: 'My Profile', icon: '👤' },
      { path: '/dashboard/messages', label: 'Messages', icon: '💬' },
      { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' }
    ];

    if (isAdmin()) {
      return [
        ...commonItems,
        { path: '/dashboard/users', label: 'Manage Users', icon: '👥' },
        { path: '/dashboard/doctors', label: 'Manage Doctors', icon: '👨‍⚕️' },
        { path: '/dashboard/appointments', label: 'All Appointments', icon: '📅' },
        { path: '/dashboard/departments', label: 'Departments', icon: '🏢' },
        { path: '/dashboard/analytics', label: 'Analytics', icon: '📊' },
        { path: '/dashboard/system', label: 'System Status', icon: '🖥️' },
        { path: '/dashboard/add-doctor', label: 'Add Doctor', icon: '➕' },
        { path: '/dashboard/add-admin', label: 'Add Admin', icon: '🔐' }
      ];
    } else if (isDoctor()) {
      return [
        ...commonItems,
        { path: '/dashboard/my-patients', label: 'My Patients', icon: '🏥' },
        { path: '/dashboard/appointments', label: 'My Appointments', icon: '📅' },
        { path: '/dashboard/medical-records', label: 'Medical Records', icon: '📋' },
        { path: '/dashboard/prescriptions', label: 'Prescriptions', icon: '💊' },
        { path: '/dashboard/lab-results', label: 'Lab Results', icon: '🧪' },
        { path: '/dashboard/schedule', label: 'My Schedule', icon: '⏰' },
        { path: '/dashboard/consultation', label: 'Video Consultation', icon: '🎥' }
      ];
    } else if (isPatient()) {
      return [
        ...commonItems,
        { path: '/dashboard/appointments', label: 'My Appointments', icon: '📅' },
        { path: '/dashboard/medical-history', label: 'Medical History', icon: '📋' },
        { path: '/dashboard/test-results', label: 'Test Results', icon: '🧪' },
        { path: '/dashboard/prescriptions', label: 'My Prescriptions', icon: '💊' },
        { path: '/dashboard/book-appointment', label: 'Book Appointment', icon: '➕' },
        { path: '/dashboard/health-tracker', label: 'Health Tracker', icon: '❤️' },
        { path: '/dashboard/billing', label: 'Billing & Insurance', icon: '💳' }
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="bg-slate-900 h-full min-h-screen w-64 flex flex-col text-white fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <h2 className="text-lg font-semibold">BioMedical System</h2>
        <p className="text-sm text-slate-400">
          {isAdmin() ? 'Admin Panel' : isDoctor() ? 'Doctor Portal' : 'Patient Portal'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
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
        <div className="flex items-center">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-sm">{user?.firstName?.charAt(0) || 'U'}</span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName || user?.email || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.role?.replace('ROLE_', '') || 'User'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;