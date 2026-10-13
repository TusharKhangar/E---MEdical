// src/components/dashboard/DashboardHome.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';

/** The landing page inside the dashboard, chosen by the signed-in user's role. */
const DashboardHome = () => {
  const { isAdmin, isDoctor } = useAuth();

  if (isAdmin()) return <AdminDashboard />;
  if (isDoctor()) return <DoctorDashboard />;
  return <PatientDashboard />;
};

export default DashboardHome;
