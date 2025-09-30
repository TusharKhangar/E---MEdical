// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredRoles,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (requiredRole || requiredRoles) {
    const hasAccess = requiredRoles
      ? requiredRoles.includes(user.role)
      : requiredRole
      ? user.role === requiredRole
      : true;

    if (!hasAccess) {
      // Redirect based on user role to their appropriate dashboard/page
      const roleBasedRedirect = () => {
        switch (user.role) {
          case USER_ROLES.ADMIN:
            return '/dashboard';
          case USER_ROLES.DOCTOR:
            return '/doctor-dashboard';
          case USER_ROLES.PATIENT:
          case USER_ROLES.USER:
            return '/patient-dashboard';
          default:
            return '/';
        }
      };

      return <Navigate to={roleBasedRedirect()} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;