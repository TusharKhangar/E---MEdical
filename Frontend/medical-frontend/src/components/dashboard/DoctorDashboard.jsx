// Doctor Dashboard Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [doctorStats, setDoctorStats] = useState({
    totalPatients: 145,
    todayAppointments: 8,
    pendingReports: 12,
    completedToday: 5,
    averageRating: 4.8,
    nextAppointment: '10:30 AM'
  });

  const [todaysSchedule, setTodaysSchedule] = useState([
    {
      id: 1,
      patientName: 'Sarah Johnson',
      time: '09:00 AM',
      type: 'Follow-up',
      condition: 'Hypertension',
      status: 'completed'
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      time: '10:30 AM',
      type: 'Consultation',
      condition: 'Chest Pain',
      status: 'upcoming'
    },
    {
      id: 3,
      patientName: 'Emily Davis',
      time: '11:15 AM',
      type: 'Check-up',
      condition: 'Diabetes',
      status: 'upcoming'
    },
    {
      id: 4,
      patientName: 'Robert Wilson',
      time: '02:00 PM',
      type: 'Emergency',
      condition: 'Cardiac Episode',
      status: 'urgent'
    }
  ]);

  const [recentPatients, setRecentPatients] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      lastVisit: '2025-10-15',
      condition: 'Hypertension',
      status: 'stable',
      nextAppointment: '2025-10-20'
    },
    {
      id: 2,
      name: 'Michael Chen',
      lastVisit: '2025-10-14',
      condition: 'Chest Pain Investigation',
      status: 'monitoring',
      nextAppointment: '2025-10-16'
    },
    {
      id: 3,
      name: 'Emily Davis',
      lastVisit: '2025-10-13',
      condition: 'Type 2 Diabetes',
      status: 'stable',
      nextAppointment: '2025-10-16'
    }
  ]);

  const [pendingTasks, setPendingTasks] = useState([
    {
      id: 1,
      task: 'Review lab results for John Smith',
      priority: 'high',
      dueDate: 'Today',
      type: 'lab_review'
    },
    {
      id: 2,
      task: 'Complete discharge summary for Maria Garcia',
      priority: 'medium',
      dueDate: 'Tomorrow',
      type: 'documentation'
    },
    {
      id: 3,
      task: 'Prescription renewal for David Brown',
      priority: 'low',
      dueDate: '2025-10-18',
      type: 'prescription'
    }
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
    } else if (hour >= 17) {
      greeting = 'Good evening';
    }
    return `${greeting}, Dr. ${user?.lastName || user?.firstName || 'Doctor'}!`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'upcoming':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'urgent':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'cancelled':
        return 'text-gray-700 bg-gray-100 border-gray-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'low':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Doctor Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{getGreeting()}</h1>
            <p className="text-green-100 mt-1">Your Medical Practice Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">👨‍⚕️</div>
            <div className="text-green-100 text-sm">
              Next: {doctorStats.nextAppointment}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Doctor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Patients</p>
              <p className="text-2xl font-bold text-blue-600">{doctorStats.totalPatients}</p>
              <p className="text-xs text-gray-500">Active patients</p>
            </div>
            <div className="text-3xl">🏥</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Schedule</p>
              <p className="text-2xl font-bold text-green-600">{doctorStats.todayAppointments}</p>
              <p className="text-xs text-gray-500">Appointments</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-orange-600">{doctorStats.pendingReports}</p>
              <p className="text-xs text-gray-500">Need review</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patient Rating</p>
              <p className="text-2xl font-bold text-purple-600">{doctorStats.averageRating}⭐</p>
              <p className="text-xs text-gray-500">Average rating</p>
            </div>
            <div className="text-3xl">🌟</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <span className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer">
                View Full Calendar
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {todaysSchedule.map((appointment) => (
              <div key={appointment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{appointment.condition}</p>
                    <p className="text-sm text-gray-700">{appointment.time} - {appointment.type}</p>
                  </div>
                  <div className="flex space-x-2">
                    {appointment.status === 'upcoming' && (
                      <>
                        <button className="text-green-600 hover:text-green-800 text-xs bg-green-50 px-2 py-1 rounded">
                          Start
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-2 py-1 rounded">
                          Reschedule
                        </button>
                      </>
                    )}
                    {appointment.status === 'urgent' && (
                      <button className="text-red-600 hover:text-red-800 text-xs bg-red-50 px-2 py-1 rounded">
                        Urgent
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Patients */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
              <span className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer">
                View All
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{patient.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">{patient.condition}</p>
                    <p className="text-sm text-gray-700 mb-2">
                      Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patient.status === 'stable' ? 'bg-green-100 text-green-700' :
                        patient.status === 'monitoring' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {patient.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Next: {new Date(patient.nextAppointment).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button className="text-blue-600 hover:text-blue-800 text-xs">
                      View Records
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-xs">
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pending Tasks and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingTasks.map((task) => (
              <div key={task.id} className="p-6">
                <div className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-1">{task.task}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority} priority
                      </span>
                      <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">👥</div>
              <span className="text-sm font-medium text-blue-700">View Patients</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">💊</div>
              <span className="text-sm font-medium text-green-700">Write Prescription</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">🧪</div>
              <span className="text-sm font-medium text-purple-700">Lab Results</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <div className="text-2xl mb-2">📋</div>
              <span className="text-sm font-medium text-orange-700">Medical Records</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDashboard;