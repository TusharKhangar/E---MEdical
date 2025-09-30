// src/components/dashboard/DoctorDetails.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../common/DataTable';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

const DoctorDetails = () => {
  const { canAccessAdmin } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock doctor data
  const mockDoctors = [
    {
      id: 1,
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@remedic.com',
      gender: 'FEMALE',
      phone: '+91 9876543210',
      address: 'Mumbai, Maharashtra',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology)',
      experience: 15,
      consultationFee: 1500,
      licenseNumber: 'MH12345',
      status: 'Active',
      joinedDate: '2020-03-15',
      lastSeen: 'Thu Mar 14 16:45:00 IST 2024',
      patientsCount: 245,
      rating: 4.8,
      bio: 'Experienced cardiologist specializing in interventional cardiology and heart disease prevention.',
      schedule: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '09:00', end: '13:00', available: true },
        sunday: { start: '09:00', end: '13:00', available: false }
      }
    },
    {
      id: 2,
      firstName: 'Dr. Michael',
      lastName: 'Smith',
      email: 'michael.smith@remedic.com',
      gender: 'MALE',
      phone: '+91 9876543211',
      address: 'Delhi, India',
      specialization: 'Neurology',
      qualification: 'MBBS, DM (Neurology)',
      experience: 12,
      consultationFee: 1800,
      licenseNumber: 'DL67890',
      status: 'Active',
      joinedDate: '2021-06-20',
      lastSeen: 'Wed Mar 13 14:30:00 IST 2024',
      patientsCount: 189,
      rating: 4.7,
      bio: 'Neurologist with expertise in treating brain disorders, epilepsy, and stroke management.',
      schedule: {
        monday: { start: '10:00', end: '18:00', available: true },
        tuesday: { start: '10:00', end: '18:00', available: true },
        wednesday: { start: '10:00', end: '18:00', available: false },
        thursday: { start: '10:00', end: '18:00', available: true },
        friday: { start: '10:00', end: '18:00', available: true },
        saturday: { start: '10:00', end: '14:00', available: true },
        sunday: { start: '10:00', end: '14:00', available: false }
      }
    },
    {
      id: 3,
      firstName: 'Dr. Priya',
      lastName: 'Patel',
      email: 'priya.patel@remedic.com',
      gender: 'FEMALE',
      phone: '+91 9876543212',
      address: 'Bangalore, Karnataka',
      specialization: 'Pediatrics',
      qualification: 'MBBS, MD (Pediatrics)',
      experience: 8,
      consultationFee: 1200,
      licenseNumber: 'KA11111',
      status: 'Active',
      joinedDate: '2022-01-10',
      lastSeen: 'Fri Mar 15 11:20:00 IST 2024',
      patientsCount: 156,
      rating: 4.9,
      bio: 'Pediatrician specializing in child healthcare, vaccination, and developmental disorders.',
      schedule: {
        monday: { start: '08:00', end: '16:00', available: true },
        tuesday: { start: '08:00', end: '16:00', available: true },
        wednesday: { start: '08:00', end: '16:00', available: true },
        thursday: { start: '08:00', end: '16:00', available: true },
        friday: { start: '08:00', end: '16:00', available: true },
        saturday: { start: '08:00', end: '12:00', available: false },
        sunday: { start: '08:00', end: '12:00', available: false }
      }
    },
    {
      id: 4,
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@remedic.com',
      gender: 'MALE',
      phone: '+91 9876543213',
      address: 'Chennai, Tamil Nadu',
      specialization: 'Orthopedics',
      qualification: 'MBBS, MS (Orthopedics)',
      experience: 20,
      consultationFee: 2000,
      licenseNumber: 'TN22222',
      status: 'Inactive',
      joinedDate: '2019-08-01',
      lastSeen: 'Mon Mar 11 09:15:00 IST 2024',
      patientsCount: 312,
      rating: 4.6,
      bio: 'Senior orthopedic surgeon with expertise in joint replacement and sports medicine.',
      schedule: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: false },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '09:00', end: '13:00', available: true },
        sunday: { start: '09:00', end: '13:00', available: false }
      }
    }
  ];

  if (!canAccessAdmin()) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-600">You don't have permission to view doctor details.</p>
        </div>
      </motion.div>
    );
  }

  useEffect(() => {
    setDoctors(mockDoctors);
  }, []);

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetails(true);
  };

  const handleDelete = (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
      toast.success('Doctor deleted successfully');
    }
  };

  const handleStatusToggle = (doctorId) => {
    setDoctors(prev => prev.map(doctor => 
      doctor.id === doctorId 
        ? { ...doctor, status: doctor.status === 'Active' ? 'Inactive' : 'Active' }
        : doctor
    ));
    toast.success('Doctor status updated');
  };

  const columns = [
    { key: 'id', title: 'ID' },
    { 
      key: 'name', 
      title: 'Doctor Name',
      render: (_, row) => `${row.firstName} ${row.lastName}`
    },
    { key: 'email', title: 'Email' },
    { key: 'specialization', title: 'Specialization' },
    { key: 'qualification', title: 'Qualification' },
    { 
      key: 'experience', 
      title: 'Experience',
      render: (value) => `${value} years`
    },
    { 
      key: 'consultationFee', 
      title: 'Fee',
      render: (value) => `₹${value}`
    },
    { 
      key: 'rating', 
      title: 'Rating',
      render: (value) => (
        <div className="flex items-center">
          <span className="text-yellow-500 mr-1">★</span>
          {value}
        </div>
      )
    },
    { 
      key: 'status', 
      title: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStatusToggle(row.id)}
            className={`p-1 rounded transition-colors ${
              row.status === 'Active' 
                ? 'text-red-600 hover:text-red-800' 
                : 'text-green-600 hover:text-green-800'
            }`}
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            <CheckCircleIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const stats = [
    { name: 'Total Doctors', value: doctors.length, icon: AcademicCapIcon, color: 'blue' },
    { name: 'Active Doctors', value: doctors.filter(d => d.status === 'Active').length, icon: CheckCircleIcon, color: 'green' },
    { name: 'Specializations', value: new Set(doctors.map(d => d.specialization)).size, icon: UsersIcon, color: 'purple' },
    { name: 'Total Patients', value: doctors.reduce((sum, d) => sum + d.patientsCount, 0), icon: UsersIcon, color: 'indigo' }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <span className="text-blue-600">Dashboard</span>
        <span className="mx-2">/</span>
        <span>Doctor Details</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Doctor Details Modal */}
      {showDetails && selectedDoctor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Doctor Profile
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Personal Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedDoctor.firstName} {selectedDoctor.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedDoctor.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedDoctor.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{selectedDoctor.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">{selectedDoctor.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Professional Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Specialization:</span>
                        <span className="font-medium">{selectedDoctor.specialization}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Qualification:</span>
                        <span className="font-medium">{selectedDoctor.qualification}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{selectedDoctor.experience} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">License:</span>
                        <span className="font-medium">{selectedDoctor.licenseNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consultation Fee:</span>
                        <span className="font-medium flex items-center">
                          <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                          {selectedDoctor.consultationFee}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          {selectedDoctor.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Statistics</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Patients Treated:</span>
                        <span className="font-medium">{selectedDoctor.patientsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Joined Date:</span>
                        <span className="font-medium">{selectedDoctor.joinedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Seen:</span>
                        <span className="font-medium">{selectedDoctor.lastSeen}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          selectedDoctor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedDoctor.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule and Bio */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      Weekly Schedule
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedDoctor.schedule).map(([day, schedule]) => (
                        <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="font-medium capitalize">{day}</span>
                          {schedule.available ? (
                            <span className="text-sm text-green-600">
                              {schedule.start} - {schedule.end}
                            </span>
                          ) : (
                            <span className="text-sm text-red-600">Not Available</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Bio</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedDoctor.bio}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            data={doctors}
            columns={columns}
            title="Doctor Management"
            searchable={true}
          />
        )}
      </motion.div>
    </div>
  );
};

export default DoctorDetails;