// src/pages/MakeAppointment.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  CalendarDaysIcon,
  UserIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { medicalService, errorMessage } from '../services/medicalService';

const EMPTY_FORM = { department: '', doctorId: '', date: '', time: '', message: '' };

const MakeAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Doctor directory from the backend
  useEffect(() => {
    medicalService.getDoctors()
      .then(setAllDoctors)
      .catch((error) => toast.error(errorMessage(error, 'Could not load doctors')));
  }, []);

  const departments = useMemo(
    () => [...new Set(allDoctors.map(d => d.specialization).filter(Boolean))].sort(),
    [allDoctors]
  );

  const doctors = useMemo(
    () => (formData.department
      ? allDoctors.filter(d => d.specialization === formData.department)
      : allDoctors),
    [allDoctors, formData.department]
  );

  const selectedDoctor = useMemo(
    () => allDoctors.find(d => String(d.id) === String(formData.doctorId)) || null,
    [allDoctors, formData.doctorId]
  );

  // Free slots for the chosen doctor and date
  useEffect(() => {
    if (!formData.doctorId || !formData.date) {
      setAvailableSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    medicalService.getDoctorSlots(formData.doctorId, formData.date)
      .then((result) => { if (!cancelled) setAvailableSlots(result.slots || []); })
      .catch((error) => { if (!cancelled) toast.error(errorMessage(error, 'Could not load free slots')); })
      .finally(() => { if (!cancelled) setSlotsLoading(false); });
    return () => { cancelled = true; };
  }, [formData.doctorId, formData.date]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Changing department or doctor invalidates the chosen doctor/time
      if (name === 'department' && prev.doctorId) {
        const stillValid = allDoctors.some(d => String(d.id) === String(prev.doctorId) && (!value || d.specialization === value));
        if (!stillValid) { next.doctorId = ''; next.time = ''; }
      }
      if (name === 'doctorId' || name === 'date') next.time = '';
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId || !formData.date || !formData.time) {
      toast.error('Please choose a doctor, a date and a time');
      return;
    }
    setLoading(true);
    try {
      await medicalService.bookAppointment({
        doctorId: Number(formData.doctorId),
        date: formData.date,
        time: formData.time,
        description: formData.message
      });
      toast.success('Appointment booked! The doctor will confirm it shortly.');
      navigate('/dashboard/appointments');
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to book appointment. Please try again.'));
      // The slot may have just been taken: refresh the list
      if (error.response?.status === 409) {
        setFormData(prev => ({ ...prev, time: '' }));
        medicalService.getDoctorSlots(formData.doctorId, formData.date)
          .then((result) => setAvailableSlots(result.slots || []))
          .catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => new Date().toISOString().split('T')[0];

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <span className="text-blue-600">Dashboard</span>
        <span className="mx-2">/</span>
        <span>Make Appointment</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <CalendarDaysIcon className="h-6 w-6 mr-2 text-blue-600" />
              Book Appointment
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Schedule your appointment with our experienced doctors
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Patient Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 mr-2" />
                  Appointment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={doctors.length === 0}
                    >
                      <option value="">{doctors.length ? 'Select Doctor' : 'No doctors available'}</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName}{doctor.specialization ? ` - ${doctor.specialization}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={availableSlots.length === 0}
                    >
                      <option value="">{slotsLoading ? 'Loading...' : 'Select Time'}</option>
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    {formData.doctorId && formData.date && !slotsLoading && availableSlots.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        No free slots on this date. Please pick another day.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <PencilSquareIcon className="h-5 w-5 mr-2" />
                  Reason for visit
                </h4>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  maxLength={255}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe your symptoms, concerns, or reason for this appointment..."
                />
              </div>

              {/* Selected Doctor Info */}
              {selectedDoctor && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                    Selected Doctor
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h5>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialization || 'General practice'}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  onClick={() => setFormData(EMPTY_FORM)}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Book Appointment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-3">Important Notes:</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Clinic hours are 9:00 to 17:00, closed 13:00 to 14:00</li>
            <li>• Please arrive 15 minutes before your scheduled appointment</li>
            <li>• Bring your ID and any relevant medical records</li>
            <li>• You can cancel from My Appointments; the doctor confirms each booking</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default MakeAppointment;
