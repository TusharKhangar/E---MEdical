// src/services/medicalService.js
// Every call maps to an endpoint in the Spring Boot backend (see bioMedical/.../Controller).
import api from './api';

const data = (promise) => promise.then((res) => res.data);

// Drop empty filters so the query string only carries what the user actually chose
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const medicalService = {
  // ---- Public (no login needed) ----
  getDoctors: (specialization) =>
    data(api.get('/doctors', { params: specialization ? { specialization } : {} })),
  getPublicStats: () => data(api.get('/stats')),
  getDoctorSlots: (doctorId, date) =>
    data(api.get(`/doctors/${doctorId}/slots`, { params: { date } })),

  // ---- Signed-in user, any role ----
  getProfile: () => data(api.get('/profile')),
  updateProfile: (profile) => data(api.put('/profile', profile)),
  changePassword: (currentPassword, newPassword) =>
    data(api.put('/profile/password', { currentPassword, newPassword })),

  // ---- Prescriptions (patient, their doctor or an admin can read; the doctor writes) ----
  getPrescription: (appointmentId) => data(api.get(`/appointments/${appointmentId}/prescription`)),
  savePrescription: (appointmentId, prescription) =>
    data(api.put(`/appointments/${appointmentId}/prescription`, prescription)),
  downloadPrescriptionPdf: async (appointmentId) => {
    const res = await api.get(`/appointments/${appointmentId}/prescription/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescription-${appointmentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  // ---- Patients ----
  bookAppointment: ({ doctorId, date, time, description }) =>
    data(api.post('/user/appointments', { doctorId, date, time, description })),
  getMyAppointments: () => data(api.get('/user/appointments')),
  cancelMyAppointment: (id) => data(api.patch(`/user/appointments/${id}/cancel`)),
  rescheduleMyAppointment: (id, date, time) =>
    data(api.patch(`/user/appointments/${id}/reschedule`, { date, time })),

  // ---- Doctors ----
  getDoctorAppointments: () => data(api.get('/doctor/appointments')),
  setDoctorAppointmentStatus: (id, status) =>
    data(api.patch(`/doctor/appointments/${id}/status`, { status })),
  getMySchedule: () => data(api.get('/doctor/schedule')),
  updateMySchedule: (days) => data(api.put('/doctor/schedule', days)),
  getMyLeave: () => data(api.get('/doctor/leave')),
  addLeave: (date, reason) => data(api.post('/doctor/leave', { date, reason })),
  removeLeave: (id) => data(api.delete(`/doctor/leave/${id}`)),

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
  getMessages: () => data(api.get('/admin/messages')),
  // Server-side search: { q, status, doctorId, from, to, sort, page, size } -> { content, page, totalElements, totalPages }
  searchAppointments: (params) => data(api.get('/admin/appointments/search', { params: clean(params) })),
  // { role: 'USER' | 'DOCTOR' | 'ADMIN', q, page, size }
  searchAccounts: (params) => data(api.get('/admin/accounts', { params: clean(params) })),
  getAnalytics: (days = 30) => data(api.get('/admin/analytics', { params: { days } })),
  setMessageHandled: (id, handled) => data(api.patch(`/admin/messages/${id}`, { handled })),
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
