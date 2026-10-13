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
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';

// Dashboard Layout Component
import Dashboard from '../pages/Dashboard';

// Dashboard Components
import DashboardHome from '../components/dashboard/DashboardHome';
import UserDetails from '../components/dashboard/UserDetails';
import AddDoctorForm from '../components/dashboard/AddDoctorForm';
import AddAdminForm from '../components/dashboard/AddAdminForm';
import AdminDetails from '../components/dashboard/AdminDetails';
import DoctorDetails from '../components/dashboard/DoctorDetails';
import AppointmentList from '../components/appointments/AppointmentList';
import MakeAppointment from '../pages/MakeAppointment';
import MyProfile from '../components/dashboard/MyProfile';
import MessagesInbox from '../components/dashboard/MessagesInbox';
import Analytics from '../components/dashboard/Analytics';
import DoctorAvailability from '../components/dashboard/DoctorAvailability';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

const adminOnly = (element) => (
  <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>{element}</ProtectedRoute>
);

const patientOnly = (element) => (
  <ProtectedRoute requiredRoles={[USER_ROLES.USER, USER_ROLES.PATIENT]}>{element}</ProtectedRoute>
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Email Confirmation Routes - Standalone (no MainLayout) */}
      <Route path="/confirm" element={<EmailConfirmation />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* Protected dashboard with nested children; the home page depends on the role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        {/* Appointments (every role sees its own) */}
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="make-appointment" element={patientOnly(<MakeAppointment />)} />

        {/* Admin: people management */}
        <Route path="users" element={adminOnly(<UserDetails />)} />
        <Route path="doctor-details" element={adminOnly(<DoctorDetails />)} />
        <Route path="add-doctor" element={adminOnly(<AddDoctorForm />)} />
        <Route path="admin-details" element={adminOnly(<AdminDetails />)} />
        <Route path="add-admin" element={adminOnly(<AddAdminForm />)} />
        <Route path="messages" element={adminOnly(<MessagesInbox />)} />
        <Route path="analytics" element={adminOnly(<Analytics />)} />

        {/* Doctor: working hours and days off */}
        <Route path="availability" element={
          <ProtectedRoute requiredRole={USER_ROLES.DOCTOR}><DoctorAvailability /></ProtectedRoute>
        } />

        {/* Account */}
        <Route path="my-profile" element={<MyProfile />} />
        <Route path="settings" element={<Navigate to="/dashboard/my-profile" replace />} />

        {/* Catch-all for unknown dashboard routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Old role-specific URLs now live under /dashboard */}
      <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/doctor/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/appointment" element={<Navigate to="/dashboard/make-appointment" replace />} />

      {/* Catch all route - always redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
