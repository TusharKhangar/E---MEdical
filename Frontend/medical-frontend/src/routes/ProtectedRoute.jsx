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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" aria-label="Loading" />
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
      // Every role has its own home inside /dashboard; anyone else goes to the landing page
      const knownRole = [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT, USER_ROLES.USER]
        .includes(user.role);
      return <Navigate to={knownRole ? '/dashboard' : '/'} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;