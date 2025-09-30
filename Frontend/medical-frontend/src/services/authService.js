// src/services/authService.js

import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS, DEMO_USERS } from '../utils/constants';
import toast from 'react-hot-toast';

// Set to false to use real backend
const DEMO_MODE = false;

class AuthService {
  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  // Register user
  async register(userData) {
    try {
      if (DEMO_MODE) {
        // Demo registration logic
        const newUser = {
          id: Math.floor(Math.random() * 1000),
          ...userData,
          role: 'ROLE_PATIENT',
          fullName: `${userData.firstName} ${userData.lastName}`
        };

        toast.success('Registration successful! Please login.');
        return { success: true, user: newUser };
      } else {
        // Real API call - Transform data to match backend expectations
        const backendData = {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          gender: userData.gender,
          phoneNumber: userData.phoneNumber,
          password: userData.password,
          role: userData.role || 'ROLE_USER'
        };

        // Make API call to your backend
        const response = await api.post('/register', backendData);

        toast.success('Registration successful! Please check your email to verify your account.');
        return { success: true, user: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  }

  // Login user
  async login(email, password) {
    try {
      if (DEMO_MODE) {
        // Demo login logic
        const user = DEMO_USERS.find(u => u.email === email && u.password === password);
        if (user) {
          const userData = {
            id: Math.floor(Math.random() * 1000),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            fullName: `${user.firstName} ${user.lastName}`
          };

          const token = `demo-token-${Date.now()}`;

          // Store in localStorage
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

          toast.success('Login successful!');
          return { success: true, user: userData, token };
        } else {
          toast.error('Invalid credentials');
          return { success: false, message: 'Invalid credentials' };
        }
      } else {
        // Real API call - Send username as email to match Spring Security expectation
        const response = await api.post('/login', {
          username: email, // Spring Security expects 'username' field
          password: password
        });

        // Your backend returns { jwt: "token_here" }
        const { jwt } = response.data;

        // Create basic user object - you may want to fetch full user details
        const userData = {
          email: email,
          // You can add a separate API call here to get full user details
          // const userDetails = await api.get('/user/profile');
        };

        // Store in localStorage
        localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

        toast.success('Login successful!');
        return { success: true, user: userData, token: jwt };
      }
    } catch (error) {
      // Handle 401 Unauthorized from your backend
      if (error.response?.status === 401) {
        toast.error('Invalid email or password');
      } else {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
      }
      return { success: false, message: 'Login failed' };
    }
  }

  // Logout user
  async logout() {
    try {
      if (!DEMO_MODE) {
        // Make logout API call if your backend requires it
        await api.post(API_ENDPOINTS.LOGOUT);
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    }

    // Clear localStorage
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

  // Update user profile
  async updateProfile(userData) {
    try {
      if (DEMO_MODE) {
        // Demo update logic
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, ...userData };

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
        return { success: true, user: updatedUser };
      } else {
        // Real API call
        const response = await api.put(API_ENDPOINTS.PROFILE, userData);
        const { user } = response.data;

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        toast.success('Profile updated successfully!');
        return { success: true, user };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
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

  // Get user details after login if needed
  async getUserDetails() {
    try {
      const response = await api.get('/user/profile'); // Adjust endpoint as needed
      const user = response.data;

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