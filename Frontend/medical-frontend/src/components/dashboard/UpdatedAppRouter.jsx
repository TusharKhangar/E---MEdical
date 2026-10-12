// Updated AppRouter.jsx with Role-Based Dashboard
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

// Role-Based Dashboard Components
import RoleBasedDashboard from '../components/dashboard/RoleBasedDashboard';
import PatientDashboard from '../components/dashboard/PatientDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import DoctorDashboard from '../components/dashboard/DoctorDashboard';

// Individual Dashboard Components
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
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AppRouter = () => {
  const { user, loading, isAuthenticated, isAdmin, isDoctor, isPatient } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/about"
        element={
          <MainLayout>
            <About />
          </MainLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <MainLayout>
            <Contact />
          </MainLayout>
        }
      />
      <Route
        path="/blog"
        element={
          <MainLayout>
            <Blog />
          </MainLayout>
        }
      />
      <Route
        path="/doctors"
        element={
          <MainLayout>
            <Doctors />
          </MainLayout>
        }
      />
      <Route
        path="/departments"
        element={
          <MainLayout>
            <Departments />
          </MainLayout>
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirm-email" element={<EmailConfirmation />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* Main Dashboard Route - Role-Based */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      {/* Specific Dashboard Sub-Routes */}
      <Route
        path="/dashboard/home"
        element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        }
      />

      {/* Patient-Specific Routes */}
      <Route
        path="/dashboard/appointments"
        element={
          <ProtectedRoute>
            {isPatient() ? <AppointmentList /> : isDoctor() ? <AppointmentList /> : isAdmin() ? <AppointmentList /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/book-appointment"
        element={
          <ProtectedRoute>
            {isPatient() ? <MakeAppointment /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/medical-history"
        element={
          <ProtectedRoute>
            {isPatient() ? <MyProfile /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      {/* Doctor-Specific Routes */}
      <Route
        path="/dashboard/my-patients"
        element={
          <ProtectedRoute>
            {isDoctor() ? <UserDetails /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/medical-records"
        element={
          <ProtectedRoute>
            {isDoctor() ? <MyProfile /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/prescriptions"
        element={
          <ProtectedRoute>
            {isDoctor() || isPatient() ? <MyProfile /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      {/* Admin-Specific Routes */}
      <Route
        path="/dashboard/users"
        element={
          <ProtectedRoute>
            {isAdmin() ? <UserDetails /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/add-doctor"
        element={
          <ProtectedRoute>
            {isAdmin() ? <AddDoctorForm /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/add-admin"
        element={
          <ProtectedRoute>
            {isAdmin() ? <AddAdminForm /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin-details"
        element={
          <ProtectedRoute>
            {isAdmin() ? <AdminDetails /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/doctor-details"
        element={
          <ProtectedRoute>
            {isAdmin() || isDoctor() ? <DoctorDetails /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/analytics"
        element={
          <ProtectedRoute>
            {isAdmin() ? <Overview /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        }
      />

      {/* Common Protected Routes */}
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/my-tasks"
        element={
          <ProtectedRoute>
            <MyTasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/overview"
        element={
          <ProtectedRoute>
            <Overview />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRouter;