    // src/services/api.js

    import axios from 'axios';
    import { STORAGE_KEYS } from '../utils/constants';
    import toast from 'react-hot-toast';

    // API base URL - Update this to match your backend
    // Same-origin by default: Vite proxies /api to the backend in development, and in
    // production the Spring Boot jar serves this app. Set VITE_API_URL to point elsewhere.
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

    // Create axios instance
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Request interceptor to add auth token
    api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors globally
    api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const { status, data } = error.response || {};
        const url = error.config?.url || '';
        // The backend answers errors with plain text; a few send { message }
        const serverMessage = typeof data === 'string' && data.trim() ? data : data?.message;

        // Sign-in and registration pages show their own messages
        const isAuthCall = /\/(login|register|confirmPassword|resetPassword|forgotPassword)$/.test(url);
        if (isAuthCall) {
          return Promise.reject(error);
        }

        // Handle different error statuses
        switch (status) {
          case 400:
          case 409:
            // Validation or business-rule error: the screen shows the server's text
            break;

          case 401:
            // Unauthorized - clear storage and redirect to login
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            toast.error('Session expired. Please login again.');
            // Prevent infinite redirect loops
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            break;

          case 403:
            toast.error('Access denied. Insufficient permissions.');
            break;

          case 404:
            toast.error(serverMessage || 'Resource not found.');
            break;

          case 422:
            // Validation errors
            if (data?.errors) {
              Object.values(data.errors).forEach(error => {
                toast.error(error);
              });
            } else {
              toast.error(data?.message || 'Validation error');
            }
            break;

          case 429:
            toast.error('Too many requests. Please try again later.');
            break;

          case 500:
            toast.error('Server error. Please try again later.');
            break;

          case 502:
          case 503:
          case 504:
            toast.error('Service temporarily unavailable. Please try again later.');
            break;

          default:
            // Network errors or other issues
            if (!error.response) {
              toast.error('Network error. Please check your connection.');
            } else {
              toast.error(serverMessage || 'An unexpected error occurred');
            }
        }

        return Promise.reject(error);
      }
    );

    // Helper functions for common HTTP methods
    export const apiHelpers = {
      // GET request
      get: async (url, config = {}) => {
        return await api.get(url, config);
      },

      // POST request
      post: async (url, data, config = {}) => {
        return await api.post(url, data, config);
      },

      // PUT request
      put: async (url, data, config = {}) => {
        return await api.put(url, data, config);
      },

      // PATCH request
      patch: async (url, data, config = {}) => {
        return await api.patch(url, data, config);
      },

      // DELETE request
      delete: async (url, config = {}) => {
        return await api.delete(url, config);
      },

      // File upload
      upload: async (url, formData, onUploadProgress = null) => {
        return await api.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress,
        });
      },

      // Download file
      download: async (url, filename = 'download') => {
        const response = await api.get(url, {
          responseType: 'blob',
        });

        // Create blob link to download
        const blob = new Blob([response.data]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();

        return response;
      }
    };

    export default api;