// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { USER_ROLES } from '../utils/constants';

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = authService.getCurrentUser();
        const storedToken = authService.getToken();

        // Check if we have valid user data
        if (storedUser && storedToken && typeof storedUser === 'object') {
          setUser(storedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          // Clear invalid data
          authService.clearStorage();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid data on error
        authService.clearStorage();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);

      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
        return result;
      } else {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);

      if (result.success) {
        setUser(result.user);
        return result;
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Profile update failed' };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole(USER_ROLES.ADMIN);
  };

  // Check if user is doctor
  const isDoctor = () => {
    return hasRole(USER_ROLES.DOCTOR);
  };

  // Check if user is patient
  const isPatient = () => {
    return hasRole(USER_ROLES.PATIENT) || hasRole(USER_ROLES.USER);
  };

  // Check if user can access admin features
  const canAccessAdmin = () => {
    return hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.DOCTOR]);
  };

  const contextValue = {
    // State
    user,
    token,
    loading,
    isAuthenticated,

    // Functions
    login,
    register,
    logout,
    updateProfile,

    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isDoctor,
    isPatient,
    canAccessAdmin,

    // Utility functions
    getIsAuthenticated: () => isAuthenticated,
    getCurrentUser: () => user,
    getToken: () => token
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export { AuthProvider };
export default AuthContext;