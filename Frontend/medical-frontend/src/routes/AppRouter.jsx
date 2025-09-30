// src/routes/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/common/MainLayout';
import { USER_ROLES } from '../utils/constants';

// Public Components
import Home from '../pages/Enhanced-Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Blog from '../pages/Blog';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import Doctors from '../pages/Doctors';
import Departments from '../pages/Department';

// Email Confirmation Components
import EmailConfirmation from '../pages/EmailConfirmation';
import SetPassword from '../pages/SetPassword';

// Dashboard Layout Component  
import Dashboard from '../pages/Dashboard';

// Dashboard Components
import DashboardHome from '../components/dashboard/DashboardHome';
import MyTasks from '../components/dashboard/MyTasks';
import Overview from '../components/dashboard/Overview';
import Messages from '../components/dashboard/Messages';
import Calendar from '../components/dashboard/Calender';
import Settings from '../components/dashboard/Settings';
import UserDetails from '../components/dashboard/UserDetails';
import AddDoctorForm from '../components/dashboard/AddDoctorForm';
import AddAdminForm from '../components/dashboard/AddAdminForm';
import AdminDetails from '../components/dashboard/AdminDetails';
import DoctorDetails from '../components/dashboard/DoctorDetails';
import AppointmentList from '../components/appointments/AppointmentList';
import MakeAppointment from '../pages/MakeAppointment';
import MyProfile from '../components/dashboard/MyProfile';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Email Confirmation Routes - Standalone (no MainLayout) */}
      <Route path="/confirm" element={<EmailConfirmation />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* Protected dashboard with nested children */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Home - default */}
        <Route index element={<DashboardHome />} />

        {/* MISSING ROUTES - ADD THESE */}
        <Route path="my-tasks" element={<MyTasks />} />
        <Route path="overview" element={<Overview />} />
        <Route path="messages" element={<Messages />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />

        {/* User Management */}
        <Route path="users" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
            <UserDetails />
          </ProtectedRoute>
        } />

        {/* Doctor Management */}
        <Route path="add-doctor" element={
          <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
            <AddDoctorForm />
          </ProtectedRoute>
        } />
        <Route path="doctor-details" element={<DoctorDetails />} />

        {/* Admin Management */}
        <Route path="add-admin" element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
            <AddAdminForm />
          </ProtectedRoute>
        } />
        <Route path="admin-details" element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
            <AdminDetails />
          </ProtectedRoute>
        } />

        {/* Appointments */}
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="make-appointment" element={<MakeAppointment />} />

        {/* Profile */}
        <Route path="my-profile" element={<MyProfile />} />

        {/* Catch-all for unknown dashboard routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Additional protected admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Additional protected doctor routes */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.DOCTOR]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all route - always redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;