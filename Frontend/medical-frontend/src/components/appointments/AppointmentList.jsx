// src/components/appointments/AppointmentList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { getAppointmentsForRole, setAppointmentStatusForRole, errorMessage } from '../../services/medicalService';

const AppointmentList = () => {
  const { user, isPatient } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setAppointments(await getAppointmentsForRole(user?.role));
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load appointments'));
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter(apt => apt.status === 'PENDING').length,
    confirmed: appointments.filter(apt => apt.status === 'CONFIRMED').length,
    completed: appointments.filter(apt => apt.status === 'COMPLETED').length,
    cancelled: appointments.filter(apt => apt.status === 'CANCELLED').length
  };

  const visible = filter === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === filter.toUpperCase());

  const handleStatusChange = async (appointmentId, newStatus) => {
    if (newStatus === 'CANCELLED' && !window.confirm('Cancel this appointment?')) return;
    setBusyId(appointmentId);
    try {
      const updated = await setAppointmentStatusForRole(user?.role, appointmentId, newStatus);
      setAppointments(prev => prev.map(apt => (apt.id === appointmentId ? updated : apt)));
      toast.success(`Appointment ${updated.status.toLowerCase()}`);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the appointment'));
    } finally {
      setBusyId(null);
    }
  };

  const actionButton = (row, status, Icon, title, colour) => (
    <button
      onClick={() => handleStatusChange(row.id, status)}
      disabled={busyId === row.id}
      className={`${colour} p-1 rounded disabled:opacity-40`}
      title={title}
    >
      <Icon className="h-5 w-5" />
    </button>
  );

  const columns = [
    { key: 'date', title: 'Date' },
    { key: 'time', title: 'Time' },
    ...(isPatient()
      ? [{ key: 'doctorName', title: 'Doctor' }]
      : [{ key: 'name', title: 'Patient' }, { key: 'email', title: 'Email' }]),
    ...(user?.role === 'ROLE_ADMIN' ? [{ key: 'doctorName', title: 'Doctor' }] : []),
    { key: 'department', title: 'Department' },
    { key: 'description', title: 'Reason' },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          {isPatient() && (row.status === 'PENDING' || row.status === 'CONFIRMED') &&
            actionButton(row, 'CANCELLED', XCircleIcon, 'Cancel', 'text-red-600 hover:bg-red-50')}
          {!isPatient() && row.status === 'PENDING' && (
            <>
              {actionButton(row, 'CONFIRMED', CheckCircleIcon, 'Confirm', 'text-green-600 hover:bg-green-50')}
              {actionButton(row, 'CANCELLED', XCircleIcon, 'Cancel', 'text-red-600 hover:bg-red-50')}
            </>
          )}
          {!isPatient() && row.status === 'CONFIRMED' && (
            <>
              {actionButton(row, 'COMPLETED', CheckBadgeIcon, 'Mark completed', 'text-blue-600 hover:bg-blue-50')}
              {actionButton(row, 'CANCELLED', XCircleIcon, 'Cancel', 'text-red-600 hover:bg-red-50')}
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
                {isPatient() ? 'View and manage your appointments' : 'Confirm, complete or cancel patient appointments'}
              </p>
            </div>
          </div>
          {isPatient() && (
            <Link to="/dashboard/make-appointment" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Book New Appointment
            </Link>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: statusCounts.all, Icon: CalendarDaysIcon, colour: 'blue' },
            { label: 'Pending', value: statusCounts.pending, Icon: ClockIcon, colour: 'yellow' },
            { label: 'Confirmed', value: statusCounts.confirmed, Icon: UserIcon, colour: 'blue' },
            { label: 'Completed', value: statusCounts.completed, Icon: CheckCircleIcon, colour: 'green' }
          ].map(({ label, value, Icon, colour }) => (
            <div key={label} className={`bg-${colour}-50 rounded-lg p-4`}>
              <div className="flex items-center">
                <Icon className={`h-8 w-8 text-${colour}-600 mr-3`} />
                <div>
                  <p className={`text-sm font-medium text-${colour}-600`}>{label}</p>
                  <p className={`text-2xl font-bold text-${colour}-900`}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Appointments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {visible.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-3">📅</div>
            No {filter === 'all' ? '' : filter} appointments yet.
          </div>
        ) : (
          <DataTable
            data={visible}
            columns={columns}
            title=""
            searchable={true}
          />
        )}
      </motion.div>
    </div>
  );
};

export default AppointmentList;
