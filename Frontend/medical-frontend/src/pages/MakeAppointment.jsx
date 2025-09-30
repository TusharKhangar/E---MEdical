// src/components/dashboard/MakeAppointment.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const MakeAppointment = () => {
  const { user, isPatient } = useAuth();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    date: '',
    time: '',
    message: '',
    department: '',
    doctorId: ''
  });

  // Mock doctors data
  const mockDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      fee: 1500,
      rating: 4.8,
      availability: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    },
    {
      id: 2,
      name: 'Dr. Michael Smith',
      specialization: 'Neurology',
      fee: 1800,
      rating: 4.7,
      availability: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00']
    },
    {
      id: 3,
      name: 'Dr. Priya Patel',
      specialization: 'Pediatrics',
      fee: 1200,
      rating: 4.9,
      availability: ['08:00', '09:00', '10:00', '14:00', '15:00']
    },
    {
      id: 4,
      name: 'Dr. Rajesh Kumar',
      specialization: 'Orthopedics',
      fee: 2000,
      rating: 4.6,
      availability: ['09:00', '10:00', '11:00', '16:00', '17:00']
    }
  ];

  const departments = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Emergency Medicine',
    'General Medicine',
    'Dermatology',
    'ENT',
    'Gynecology',
    'Ophthalmology'
  ];

  useEffect(() => {
    setDoctors(mockDoctors);
    // Pre-fill user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    // Update available doctors when department changes
    if (formData.department) {
      const departmentDoctors = mockDoctors.filter(
        doctor => doctor.specialization === formData.department
      );
      setDoctors(departmentDoctors);
      
      // Reset doctor selection if current doctor doesn't match department
      if (selectedDoctor && selectedDoctor.specialization !== formData.department) {
        setSelectedDoctor(null);
        setFormData(prev => ({ ...prev, doctorId: '', time: '' }));
        setAvailableSlots([]);
      }
    } else {
      setDoctors(mockDoctors);
    }
  }, [formData.department]);

  useEffect(() => {
    // Update available time slots when doctor and date are selected
    if (formData.doctorId && formData.date) {
      const doctor = mockDoctors.find(d => d.id === parseInt(formData.doctorId));
      if (doctor) {
        setSelectedDoctor(doctor);
        setAvailableSlots(doctor.availability);
      }
    } else {
      setAvailableSlots([]);
    }
  }, [formData.doctorId, formData.date]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.date || !formData.time || !formData.doctorId) {
        toast.error('Please fill all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Validate date is not in the past
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        toast.error('Please select a future date');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Appointment booked successfully!');
      
      // Reset form
      setFormData({
        fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
        email: user?.email || '',
        date: '',
        time: '',
        message: '',
        department: '',
        doctorId: ''
      });
      setSelectedDoctor(null);
      setAvailableSlots([]);
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@example.com"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor *
                    </label>
                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={doctors.length === 0}
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization} (₹{doctor.fee})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={availableSlots.length === 0}
                    >
                      <option value="">Select Time</option>
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    {formData.doctorId && formData.date && availableSlots.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        No available slots for selected date
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <PencilSquareIcon className="h-5 w-5 mr-2" />
                  Message
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your symptoms or reason for visit
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please describe your symptoms, concerns, or reason for this appointment..."
                  />
                </div>
              </div>

              {/* Selected Doctor Info */}
              {selectedDoctor && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                    Selected Doctor
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-gray-900">{selectedDoctor.name}</h5>
                        <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm text-gray-600">{selectedDoctor.rating} rating</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">₹{selectedDoctor.fee}</p>
                        <p className="text-sm text-gray-600">Consultation fee</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  onClick={() => {
                    setFormData({
                      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
                      email: user?.email || '',
                      date: '',
                      time: '',
                      message: '',
                      department: '',
                      doctorId: ''
                    });
                    setSelectedDoctor(null);
                    setAvailableSlots([]);
                  }}
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
            <li>• Please arrive 15 minutes before your scheduled appointment</li>
            <li>• Bring your ID and any relevant medical records</li>
            <li>• Appointments can be rescheduled up to 24 hours in advance</li>
            <li>• Consultation fees are payable at the time of visit</li>
            <li>• You will receive a confirmation email once your appointment is booked</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default MakeAppointment;