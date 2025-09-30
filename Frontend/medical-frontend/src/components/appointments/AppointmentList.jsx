// src/components/appointments/AppointmentList.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDaysIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import DataTable from '../common/DataTable';

const AppointmentList = () => {
  const { user, isPatient, isDoctor, isAdmin } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);

    // Mock data based on user role
    setTimeout(() => {
      const mockAppointments = [
        {
          id: 1,
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          email: 'john.doe@example.com',
          date: '2024-03-20',
          time: '10:00 AM',
          department: 'Cardiology',
          status: 'PENDING',
          reason: 'Regular checkup',
          phone: '+1-234-567-8901'
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          doctorName: 'Dr. Johnson',
          email: 'jane.smith@example.com',
          date: '2024-03-21',
          time: '2:30 PM',
          department: 'Neurology',
          status: 'CONFIRMED',
          reason: 'Follow-up consultation',
          phone: '+1-234-567-8902'
        },
        {
          id: 3,
          patientName: 'Mike Wilson',
          doctorName: 'Dr. Brown',
          email: 'mike.wilson@example.com',
          date: '2024-03-19',
          time: '9:00 AM',
          department: 'General',
          status: 'COMPLETED',
          reason: 'Annual physical',
          phone: '+1-234-567-8903'
        },
        {
          id: 4,
          patientName: 'Sarah Davis',
          doctorName: 'Dr. Garcia',
          email: 'sarah.davis@example.com',
          date: '2024-03-18',
          time: '11:30 AM',
          department: 'Pediatrics',
          status: 'CANCELLED',
          reason: 'Vaccination',
          phone: '+1-234-567-8904'
        }
      ];

      // Filter based on current filter
      let filteredAppointments = mockAppointments;
      if (filter !== 'all') {
        filteredAppointments = mockAppointments.filter(apt => apt.status === filter.toUpperCase());
      }

      setAppointments(filteredAppointments);
      setLoading(false);
    }, 500);
  };

  const getStatusCounts = () => {
    return {
      all: appointments.length,
      pending: appointments.filter(apt => apt.status === 'PENDING').length,
      confirmed: appointments.filter(apt => apt.status === 'CONFIRMED').length,
      completed: appointments.filter(apt => apt.status === 'COMPLETED').length,
      cancelled: appointments.filter(apt => apt.status === 'CANCELLED').length
    };
  };

  const statusCounts = getStatusCounts();

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'patientName', title: 'Patient' },
    { key: 'doctorName', title: 'Doctor' },
    { key: 'date', title: 'Date' },
    { key: 'time', title: 'Time' },
    { key: 'department', title: 'Department' },
    { key: 'reason', title: 'Reason' },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
          value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
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
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {!isPatient() && row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleStatusChange(row.id, 'CONFIRMED')}
                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                title="Confirm"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleStatusChange(row.id, 'CANCELLED')}
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                title="Cancel"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Appointments', count: statusCounts.all },
    { value: 'pending', label: 'Pending', count: statusCounts.pending },
    { value: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
    { value: 'completed', label: 'Completed', count: statusCounts.completed },
    { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isPatient() ? 'My Appointments' : 'Appointment Management'}
              </h1>
              <p className="text-gray-600">
                {isPatient() ? 'View and manage your appointments' : 'Manage patient appointments'}
              </p>
            </div>
          </div>
          {isPatient() && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Book New Appointment
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{statusCounts.all}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{statusCounts.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{statusCounts.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-900">{statusCounts.confirmed}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appointments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <DataTable
          data={appointments}
          columns={columns}
          title=""
          searchable={true}
        />
      </motion.div>
    </div>
  );
};

export default AppointmentList;