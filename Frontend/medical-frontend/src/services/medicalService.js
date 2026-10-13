// src/services/medicalService.js
// Every call maps to an endpoint in the Spring Boot backend (see bioMedical/.../Controller).
import api from './api';

const data = (promise) => promise.then((res) => res.data);

export const medicalService = {
  // ---- Public (no login needed) ----
  getDoctors: (specialization) =>
    data(api.get('/doctors', { params: specialization ? { specialization } : {} })),
  getDoctorSlots: (doctorId, date) =>
    data(api.get(`/doctors/${doctorId}/slots`, { params: { date } })),

  // ---- Signed-in user, any role ----
  getProfile: () => data(api.get('/profile')),
  updateProfile: (profile) => data(api.put('/profile', profile)),
  changePassword: (currentPassword, newPassword) =>
    data(api.put('/profile/password', { currentPassword, newPassword })),

  // ---- Patients ----
  bookAppointment: ({ doctorId, date, time, description }) =>
    data(api.post('/user/appointments', { doctorId, date, time, description })),
  getMyAppointments: () => data(api.get('/user/appointments')),
  cancelMyAppointment: (id) => data(api.patch(`/user/appointments/${id}/cancel`)),

  // ---- Doctors ----
  getDoctorAppointments: () => data(api.get('/doctor/appointments')),
  setDoctorAppointmentStatus: (id, status) =>
    data(api.patch(`/doctor/appointments/${id}/status`, { status })),

  // ---- Admins ----
  getStats: () => data(api.get('/admin/stats')),
  getAllAppointments: () => data(api.get('/admin/appointments')),
  setAppointmentStatus: (id, status) =>
    data(api.patch(`/admin/appointments/${id}/status`, { status })),
  getPatients: () => data(api.get('/admin/users')),
  getAdminDoctors: () => data(api.get('/admin/doctors')),
  getAdmins: () => data(api.get('/admin/admins')),
  addDoctor: (doctor) => data(api.post('/admin/doctors', doctor)),
  addAdmin: (admin) => data(api.post('/admin/admins', admin)),
  setUserEnabled: (id, enabled) => data(api.patch(`/admin/users/${id}/enabled`, { enabled })),
};

/** Appointments for whoever is signed in, picked by role. */
export const getAppointmentsForRole = (role) => {
  if (role === 'ROLE_ADMIN') return medicalService.getAllAppointments();
  if (role === 'ROLE_DOCTOR') return medicalService.getDoctorAppointments();
  return medicalService.getMyAppointments();
};

/** Change an appointment's status as whoever is signed in. */
export const setAppointmentStatusForRole = (role, id, status) => {
  if (role === 'ROLE_ADMIN') return medicalService.setAppointmentStatus(id, status);
  if (role === 'ROLE_DOCTOR') return medicalService.setDoctorAppointmentStatus(id, status);
  return medicalService.cancelMyAppointment(id);
};

/** The error text the backend sent, or a fallback. The API answers errors with plain text. */
export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const body = error?.response?.data;
  if (typeof body === 'string' && body.trim()) return body;
  return body?.message || fallback;
};

export default medicalService;
