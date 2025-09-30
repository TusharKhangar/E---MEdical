import api from './api';

export const medicalService = {
  // Departments
  getDepartments: async () => {
    return await api.get('/api/departments');
  },

  getDepartmentById: async (id) => {
    return await api.get(`/api/departments/${id}`);
  },

  // Doctors
  getDoctors: async () => {
    return await api.get('/api/doctors');
  },

  getDoctorById: async (id) => {
    return await api.get(`/api/doctors/${id}`);
  },

  getDoctorsByDepartment: async (departmentId) => {
    return await api.get(`/api/doctors/department/${departmentId}`);
  },

  // Appointments
  getAppointments: async () => {
    return await api.get('/api/appointments');
  },

  createAppointment: async (appointmentData) => {
    return await api.post('/api/appointments', appointmentData);
  },

  updateAppointment: async (id, appointmentData) => {
    return await api.put(`/api/appointments/${id}`, appointmentData);
  },

  cancelAppointment: async (id) => {
    return await api.delete(`/api/appointments/${id}`);
  },

  getAppointmentHistory: async () => {
    return await api.get('/api/appointments/history');
  },

  // Search
  searchDoctors: async (query) => {
    return await api.get(`/api/doctors/search?q=${query}`);
  },

  searchDepartments: async (query) => {
    return await api.get(`/api/departments/search?q=${query}`);
  },
};