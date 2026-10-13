// src/services/authService.js

import api from './api';
import { STORAGE_KEYS } from '../utils/constants';
import { medicalService, errorMessage } from './medicalService';
import toast from 'react-hot-toast';

class AuthService {
  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  // Register a patient. The password is chosen later from the link in the confirmation e-mail.
  async register(userData) {
    try {
      const response = await api.post('/register', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        phoneNumber: userData.phoneNumber
      });
      toast.success(response.data || 'Registration successful! Please check your email.');
      return { success: true, message: response.data };
    } catch (error) {
      const message = errorMessage(error, 'Registration failed');
      toast.error(message);
      return { success: false, message };
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Spring Security expects a 'username' field; we sign in with the e-mail
      const response = await api.post('/login', { username: email, password });
      const { jwt, ...profile } = response.data;

      // The backend returns id, email, firstName, lastName and role next to the token
      const userData = {
        ...profile,
        fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
      };

      localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      toast.success('Login successful!');
      return { success: true, user: userData, token: jwt };
    } catch (error) {
      const message = errorMessage(error, 'Login failed');
      toast.error(message);
      return { success: false, message };
    }
  }

  // Logout user. Tokens are stateless, so there is nothing to tell the server.
  async logout() {
    this.clearStorage();
    toast.success('Logout successful');
    return { success: true };
  }

  // =============================================================================
  // USER MANAGEMENT METHODS
  // =============================================================================

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      // Check for invalid values before parsing
      if (!userStr || userStr === "undefined" || userStr === "null") {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  }

  // Get current token from localStorage
  getToken() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return token && token !== "undefined" && token !== "null" ? token : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Update user profile (name, phone, gender, and specialization for doctors)
  async updateProfile(userData) {
    try {
      const profile = await medicalService.updateProfile(userData);
      const user = {
        ...this.getCurrentUser(),
        ...profile,
        fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      toast.success('Profile updated successfully!');
      return { success: true, user };
    } catch (error) {
      const message = errorMessage(error, 'Profile update failed');
      toast.error(message);
      return { success: false, message };
    }
  }

  // =============================================================================
  // ROLE MANAGEMENT METHODS
  // =============================================================================

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return user?.role && roles.includes(user.role);
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('ROLE_ADMIN');
  }

  // Check if user is doctor
  isDoctor() {
    return this.hasRole('ROLE_DOCTOR');
  }

  // Check if user is patient
  isPatient() {
    return this.hasRole('ROLE_PATIENT') || this.hasRole('ROLE_USER');
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // Clear all stored data
  clearStorage() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Get user display name
  getUserDisplayName() {
    const user = this.getCurrentUser();
    if (user) {
      return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    }
    return 'Guest';
  }

  // Get user role display name
  getUserRoleDisplayName() {
    const user = this.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'ROLE_ADMIN':
          return 'Administrator';
        case 'ROLE_DOCTOR':
          return 'Doctor';
        case 'ROLE_PATIENT':
        case 'ROLE_USER':
          return 'Patient';
        default:
          return 'User';
      }
    }
    return 'Guest';
  }

  // Refresh the stored user from the server
  async getUserDetails() {
    try {
      const profile = await medicalService.getProfile();
      const user = { ...this.getCurrentUser(), ...profile };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      return { success: false };
    }
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
