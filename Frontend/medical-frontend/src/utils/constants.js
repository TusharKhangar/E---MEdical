// src/utils/constants.js

// =============================================================================
// API ENDPOINTS
// =============================================================================
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  PROFILE: '/profile',

  // User Management
  USERS: '/users',
  USER_BY_ID: '/users/:id',

  // Appointments
  APPOINTMENTS: '/appointments',
  APPOINTMENT_BY_ID: '/appointments/:id',
  MY_APPOINTMENTS: '/appointments/my',

  // Medical
  DOCTORS: '/doctors',
  DEPARTMENTS: '/departments',
  MEDICAL_RECORDS: '/medical-records',
  PRESCRIPTIONS: '/prescriptions',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports'
};

// =============================================================================
// STORAGE KEYS
// =============================================================================
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
  LANGUAGE: 'app_language',
  THEME: 'app_theme'
};

// =============================================================================
// USER ROLES
// =============================================================================
export const USER_ROLES = {
  ADMIN: 'ROLE_ADMIN',
  DOCTOR: 'ROLE_DOCTOR',
  PATIENT: 'ROLE_PATIENT',
  USER: 'ROLE_USER',
  STAFF: 'ROLE_STAFF'
};

// =============================================================================
// DEMO USERS (FOR DEVELOPMENT ONLY)
// =============================================================================
export const DEMO_USERS = [
  {
    id: 1,
    email: 'admin@remedic.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: USER_ROLES.ADMIN,
    gender: 'OTHER',
    phoneNumber: '+1234567890'
  },
  {
    id: 2,
    email: 'doctor@remedic.com',
    password: 'doctor123',
    firstName: 'Dr. Sarah',
    lastName: 'Smith',
    role: USER_ROLES.DOCTOR,
    gender: 'FEMALE',
    phoneNumber: '+1234567891'
  },
  {
    id: 3,
    email: 'patient@remedic.com',
    password: 'patient123',
    firstName: 'John',
    lastName: 'Doe',
    role: USER_ROLES.PATIENT,
    gender: 'MALE',
    phoneNumber: '+1234567892'
  }
];

// =============================================================================
// APPOINTMENT STATUS
// =============================================================================
export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};

// =============================================================================
// GENDER OPTIONS
// =============================================================================
export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
];

// =============================================================================
// ROLE DISPLAY NAMES
// =============================================================================
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.DOCTOR]: 'Doctor',
  [USER_ROLES.PATIENT]: 'Patient',
  [USER_ROLES.USER]: 'Patient',
  [USER_ROLES.STAFF]: 'Staff Member'
};

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// =============================================================================
// MEDICAL DEPARTMENTS
// =============================================================================
export const MEDICAL_DEPARTMENTS = [
  {
    id: 1,
    name: 'General Medicine',
    code: 'GM',
    description: 'General medical consultations and checkups'
  },
  {
    id: 2,
    name: 'Cardiology',
    code: 'CARD',
    description: 'Heart and cardiovascular system'
  },
  {
    id: 3,
    name: 'Dermatology',
    code: 'DERM',
    description: 'Skin, hair, and nail conditions'
  },
  {
    id: 4,
    name: 'Orthopedics',
    code: 'ORTH',
    description: 'Bones, joints, and muscular system'
  },
  {
    id: 5,
    name: 'Pediatrics',
    code: 'PED',
    description: 'Children and adolescent healthcare'
  },
  {
    id: 6,
    name: 'Gynecology',
    code: 'GYN',
    description: 'Women\'s reproductive health'
  },
  {
    id: 7,
    name: 'Ophthalmology',
    code: 'OPH',
    description: 'Eye and vision care'
  },
  {
    id: 8,
    name: 'ENT',
    code: 'ENT',
    description: 'Ear, nose, and throat specialist'
  }
];

// =============================================================================
// TIME SLOTS
// =============================================================================
export const TIME_SLOTS = {
  MORNING: [
    { value: '09:00', label: '9:00 AM' },
    { value: '09:30', label: '9:30 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '10:30', label: '10:30 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '11:30', label: '11:30 AM' }
  ],
  AFTERNOON: [
    { value: '14:00', label: '2:00 PM' },
    { value: '14:30', label: '2:30 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '15:30', label: '3:30 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '16:30', label: '4:30 PM' }
  ],
  EVENING: [
    { value: '17:00', label: '5:00 PM' },
    { value: '17:30', label: '5:30 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '18:30', label: '6:30 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '19:30', label: '7:30 PM' }
  ]
};

// =============================================================================
// VALIDATION PATTERNS
// =============================================================================
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s]{2,50}$/
};

// =============================================================================
// ERROR MESSAGES
// =============================================================================
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_NAME: 'Name must be 2-50 characters and contain only letters',
  LOGIN_FAILED: 'Invalid email or password',
  REGISTRATION_FAILED: 'Registration failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please login again'
};

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email to verify your account',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully!',
  APPOINTMENT_BOOKED: 'Appointment booked successfully!',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
  PASSWORD_CHANGED: 'Password changed successfully'
};

// =============================================================================
// ROUTES
// =============================================================================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  APPOINTMENTS: '/appointments',
  BOOK_APPOINTMENT: '/book-appointment',
  MEDICAL_RECORDS: '/medical-records',
  DOCTORS: '/doctors',
  DEPARTMENTS: '/departments',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_APPOINTMENTS: '/admin/appointments',
  ADMIN_REPORTS: '/admin/reports',

  // Doctor routes
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  DOCTOR_PATIENTS: '/doctor/patients',
  DOCTOR_APPOINTMENTS: '/doctor/appointments',
  DOCTOR_SCHEDULE: '/doctor/schedule'
};

// =============================================================================
// BREAKPOINTS (for responsive design)
// =============================================================================
export const BREAKPOINTS = {
  XS: '320px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

// =============================================================================
// THEME COLORS
// =============================================================================
export const THEME_COLORS = {
  PRIMARY: '#e91e63',
  SECONDARY: '#9c27b0',
  ACCENT: '#2196f3',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3'
};

// =============================================================================
// LOCAL STORAGE DEFAULTS
// =============================================================================
export const STORAGE_DEFAULTS = {
  LANGUAGE: 'en',
  THEME: 'light'
};

export default {
  API_ENDPOINTS,
  STORAGE_KEYS,
  USER_ROLES,
  DEMO_USERS,
  APPOINTMENT_STATUS,
  GENDER_OPTIONS,
  ROLE_DISPLAY_NAMES,
  NOTIFICATION_TYPES,
  MEDICAL_DEPARTMENTS,
  TIME_SLOTS,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  BREAKPOINTS,
  THEME_COLORS,
  STORAGE_DEFAULTS
};