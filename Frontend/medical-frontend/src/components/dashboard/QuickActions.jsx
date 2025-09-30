// src/components/dashboard/QuickActions.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  PlusIcon,
  UserPlusIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const QuickActions = () => {
  const navigate = useNavigate();
  const { isAdmin, isDoctor, isPatient } = useAuth();

  // Define actions based on user role
  const getQuickActions = () => {
    if (isAdmin()) {
      return [
        {
          title: 'Add New User',
          description: 'Register a new patient',
          icon: PlusIcon,
          color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800',
          iconColor: 'text-green-600',
          action: () => navigate('/dashboard/users?action=add')
        },
        {
          title: 'Add Doctor',
          description: 'Register a new doctor',
          icon: AcademicCapIcon,
          color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800',
          iconColor: 'text-purple-600',
          action: () => navigate('/dashboard/add-doctor')
        },
        {
          title: 'View Schedule',
          description: 'Check doctor schedules',
          icon: CalendarDaysIcon,
          color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800',
          iconColor: 'text-orange-600',
          action: () => navigate('/dashboard/doctor-details')
        },
        {
          title: 'Generate Report',
          description: 'Create system reports',
          icon: DocumentChartBarIcon,
          color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800',
          iconColor: 'text-blue-600',
          action: () => window.open('/reports', '_blank')
        }
      ];
    }

    if (isDoctor()) {
      return [
        {
          title: 'View Appointments',
          description: 'Check your appointments',
          icon: CalendarDaysIcon,
          color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800',
          iconColor: 'text-blue-600',
          action: () => navigate('/dashboard/appointments')
        },
        {
          title: 'Patient Records',
          description: 'Access patient files',
          icon: ClipboardDocumentListIcon,
          color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800',
          iconColor: 'text-green-600',
          action: () => navigate('/dashboard/patients')
        },
        {
          title: 'My Profile',
          description: 'Update your profile',
          icon: UsersIcon,
          color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800',
          iconColor: 'text-purple-600',
          action: () => navigate('/dashboard/my-profile')
        },
        {
          title: 'Schedule',
          description: 'Manage your schedule',
          icon: CogIcon,
          color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800',
          iconColor: 'text-orange-600',
          action: () => navigate('/dashboard/my-profile?tab=schedule')
        }
      ];
    }

    // Patient actions
    return [
      {
        title: 'Book Appointment',
        description: 'Schedule a new appointment',
        icon: PlusIcon,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800',
        iconColor: 'text-blue-600',
        action: () => navigate('/dashboard/make-appointment')
      },
      {
        title: 'View History',
        description: 'Check appointment history',
        icon: ClipboardDocumentListIcon,
        color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800',
        iconColor: 'text-green-600',
        action: () => navigate('/dashboard/appointments')
      },
      {
        title: 'Find Doctors',
        description: 'Browse available doctors',
        icon: AcademicCapIcon,
        color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800',
        iconColor: 'text-purple-600',
        action: () => navigate('/dashboard/doctor-details')
      },
      {
        title: 'My Profile',
        description: 'Update your information',
        icon: UsersIcon,
        color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800',
        iconColor: 'text-orange-600',
        action: () => navigate('/dashboard/my-profile')
      }
    ];
  };

  const actions = getQuickActions();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.action}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md transform hover:scale-105 ${action.color}`}
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-full bg-white shadow-sm`}>
                  <Icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
              </div>
              <h4 className="font-medium text-sm mb-1">{action.title}</h4>
              <p className="text-xs opacity-80">{action.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;