// src/pages/Dashboard.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import PatientDashboard from '../components/dashboard/PatientDashboard';
import { USER_ROLES } from '../utils/constants';

const Dashboard = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuth();

  // Check if user is a patient/regular user
  const isRegularUser = user?.role === 'ROLE_USER' ||
                       user?.role === 'ROLE_PATIENT' ||
                       user?.role === 'USER' ||
                       user?.role === 'PATIENT' ||
                       isPatient();

  // If it's a patient/user, show the patient-friendly dashboard
  if (isRegularUser) {
    return <PatientDashboard />;
  }

  // For admin and doctors, show the business dashboard with sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
