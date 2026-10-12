// src/pages/Dashboard.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import PatientDashboard from '../components/dashboard/PatientDashboard';
import { USER_ROLES } from '../utils/constants';
import Header from '../components/common/Header'; 
import AdminDashboard from '../components/dashboard/AdminDashboard';

const Dashboard = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuth();
  // Check if user is a patient/regular user

  const role  = "user";
  const isRegularUser = user?.role === 'ROLE_USER' ||
                       user?.role === 'ROLE_PATIENT' ||
                       user?.role === 'USER' ||
                       user?.role === 'PATIENT' ||
                       isPatient();

  // If it's a patient/user, show the patient-friendly dashboard
  if (isRegularUser) {
    return  <> <Header/>, <PatientDashboard /> </>;
  }
  

  if(user.role === 'ROLE_ADMIN'){
    return(
      <div className="flex h-screen bg-gray-900">
       <div className="w-64 h-screen">
       <DashboardSidebar />
       </div>
       <div className="flex-1 overflow-auto">
        <AdminDashboard/>
      </div>
      </div>
    );
  }

  // For admin and doctors, show the business dashboard with sidebar
  return (
    `${role == 'user'? <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <Outlet />
      </main>
    </div> : <h1>ok</h1> }`
  );
};

export default Dashboard;
