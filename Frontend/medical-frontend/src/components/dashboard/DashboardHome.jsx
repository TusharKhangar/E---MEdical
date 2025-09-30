// src/components/dashboard/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDaysIcon,
  UsersIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import DataTable from '../common/DataTable';

const DashboardHome = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuth();

  const [stats, setStats] = useState({
    appointments: 15,
    patients: 10,
    doctors: 5,
    admins: 3,
    totalUsers: 142,
    totalAppointments: 28,
    totalDoctors: 15,
    pendingAppointments: 8,
    completedToday: 12,
    revenue: 45750
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Mock data for demonstration
      const mockAppointments = [
        {
          id: 16,
          patientName: 'Soumyadip Chowdhury',
          email: 'testUser@gmail.com',
          date: '2024-03-15',
          time: '10:00pm',
          department: 'Cardiology',
          doctor: 'Dr. Smith',
          message: 'Fever',
          status: 'PENDING',
          regTime: '2019-06-08 17:52:26'
        },
        {
          id: 17,
          patientName: 'Soumyadip Chowdhury',
          email: 'testUser@gmail.com',
          date: '2024-03-15',
          time: '11:00pm',
          department: 'Neurology',
          doctor: 'Dr. Johnson',
          message: 'Fever',
          status: 'CONFIRMED',
          regTime: '2019-06-08 17:52:08'
        },
        {
          id: 18,
          patientName: 'Soumyadip Chowdhury',
          email: 'hello@gmail.com',
          date: '2024-03-16',
          time: '12:30am',
          department: 'Emergency',
          doctor: 'Dr. Brown',
          message: 'Cold',
          status: 'COMPLETED',
          regTime: '2019-06-08 18:34:17'
        }
      ];

      const mockUsers = [
        {
          id: 1,
          firstName: 'Soumyadip',
          lastName: 'Chowdhury',
          email: 'soumyadip.note@gmail.com',
          gender: 'MALE',
          role: 'ROLE_ADMIN',
          lastSeen: 'Tue Aug 06 17:18:10 IST 2019'
        },
        {
          id: 8,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          gender: 'MALE',
          role: 'ROLE_USER',
          lastSeen: 'Mon Mar 15 10:30:00 IST 2024'
        }
      ];

      setRecentAppointments(mockAppointments);
      setRecentUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    return `${greeting}, ${user?.firstName || user?.fullName || 'User'}!`;
  };

  // Dashboard overview cards matching the reference image
  const overviewCards = [
    {
      label: 'Appointments',
      value: stats.appointments,
      icon: <CalendarDaysIcon className="w-8 h-8 text-blue-500" />,
      bgColor: 'bg-blue-50',
      change: '+8.2%'
    },
    {
      label: 'Patients',
      value: stats.patients,
      icon: <UsersIcon className="w-8 h-8 text-blue-500" />,
      bgColor: 'bg-blue-50',
      change: '+12.5%'
    },
    {
      label: 'Doctors',
      value: stats.doctors,
      icon: <AcademicCapIcon className="w-8 h-8 text-blue-500" />,
      bgColor: 'bg-blue-50',
      change: '+2.1%'
    },
    {
      label: 'Admins',
      value: stats.admins,
      icon: <ShieldCheckIcon className="w-8 h-8 text-blue-500" />,
      bgColor: 'bg-blue-50',
      change: '+5.4%'
    }
  ];

  const appointmentColumns = [
    { key: 'id', title: 'ID' },
    { key: 'patientName', title: 'Patient Name' },
    { key: 'email', title: 'Email' },
    { key: 'date', title: 'Date' },
    { key: 'time', title: 'Time' },
    { key: 'department', title: 'Department' },
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
          <button className="text-blue-600 hover:text-blue-800">
            <EyeIcon className="h-4 w-4" />
          </button>
          {!isPatient() && (
            <>
              <button className="text-green-600 hover:text-green-800">
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button className="text-red-600 hover:text-red-800">
                <XCircleIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the Dashboard!
          </h1>
          <p className="text-lg text-gray-600">Dashboard Overview</p>
        </div>

        {/* Overview Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${card.bgColor} mb-4`}>
                    {card.icon}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">{card.label}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                  {card.change && (
                    <p className="text-sm text-green-600 font-medium">{card.change} from last month</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Appointments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
            Recent Appointments
          </h3>
        </div>
        <div className="p-6">
          <DataTable
            data={recentAppointments}
            columns={appointmentColumns}
            title=""
            searchable={true}
          />
        </div>
      </motion.div>

      {/* System Status and Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server Status</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <span className="flex items-center text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                Moderate Load
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-900">2 hours ago</span>
            </div>
          </div>
        </motion.div>

        {/* Pending Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isPatient() ? 'Upcoming Appointments' : 'Pending Tasks'}
          </h3>
          <div className="space-y-3">
            {isPatient() ? (
              <>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cardiology Checkup</p>
                    <p className="text-xs text-gray-600">Tomorrow at 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CalendarDaysIcon className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Lab Results</p>
                    <p className="text-xs text-gray-600">Available in 2 days</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Review 8 pending appointments</p>
                    <p className="text-xs text-gray-600">Due today</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">System backup overdue</p>
                    <p className="text-xs text-gray-600">Schedule maintenance</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;