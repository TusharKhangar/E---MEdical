// Admin Dashboard Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState({
    totalUsers: 1247,
    totalDoctors: 87,
    totalPatients: 1156,
    totalAppointments: 2845,
    pendingRegistrations: 12,
    systemHealth: 98.5,
    monthlyRevenue: 125780,
    emergencyAlerts: 3
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'USER_REGISTRATION',
      message: 'New patient registered: Dr. Sarah Johnson',
      timestamp: '2025-10-16T08:30:00Z',
      severity: 'info'
    },
    {
      id: 2,
      type: 'SYSTEM_ALERT',
      message: 'Server maintenance scheduled for tonight',
      timestamp: '2025-10-16T07:15:00Z',
      severity: 'warning'
    },
    {
      id: 3,
      type: 'EMERGENCY',
      message: 'Emergency department capacity at 90%',
      timestamp: '2025-10-16T06:45:00Z',
      severity: 'error'
    }
  ]);

  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 1,
      type: 'doctor',
      name: 'Dr. Michael Smith',
      specialization: 'Cardiology',
      submittedAt: '2025-10-15',
      status: 'pending'
    },
    {
      id: 2,
      type: 'patient',
      name: 'Emily Johnson',
      registrationType: 'Online Registration',
      submittedAt: '2025-10-16',
      status: 'pending'
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
    return `${greeting}, ${user?.firstName || 'Admin'}!`;
  };

  const handleApproval = (id, action) => {
    setPendingApprovals(prev => 
      prev.map(approval => 
        approval.id === id 
          ? { ...approval, status: action }
          : approval
      )
    );
    // In real app, make API call here
    console.log(`${action} approval for ID: ${id}`);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Admin Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{getGreeting()}</h1>
            <p className="text-indigo-100 mt-1">System Administrator Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">🛡️</div>
            <div className="text-indigo-100 text-sm">Admin Control Panel</div>
          </div>
        </div>
      </motion.div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">{adminStats.totalUsers}</p>
              <p className="text-xs text-green-500">↑ 12% from last month</p>
            </div>
            <div className="text-3xl">👥</div>
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
              <p className="text-sm font-medium text-gray-600">Active Doctors</p>
              <p className="text-2xl font-bold text-green-600">{adminStats.totalDoctors}</p>
              <p className="text-xs text-green-500">↑ 8% from last month</p>
            </div>
            <div className="text-3xl">👨‍⚕️</div>
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
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-purple-600">{adminStats.systemHealth}%</p>
              <p className="text-xs text-green-500">All systems operational</p>
            </div>
            <div className="text-3xl">💚</div>
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
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-orange-600">${adminStats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-500">↑ 15% from last month</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {pendingApprovals.length} pending
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{approval.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        approval.type === 'doctor' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {approval.type === 'doctor' ? '👨‍⚕️ Doctor' : '🏥 Patient'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {approval.specialization || approval.registrationType}
                    </p>
                    <p className="text-xs text-gray-500">Submitted: {approval.submittedAt}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproval(approval.id, 'approved')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleApproval(approval.id, 'rejected')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent System Activities</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-6">
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.severity === 'error' ? 'bg-red-500' :
                    activity.severity === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Admin Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="text-2xl mb-2">👨‍⚕️</div>
            <span className="text-sm font-medium text-blue-700">Add Doctor</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="text-2xl mb-2">🏥</div>
            <span className="text-sm font-medium text-green-700">Manage Departments</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <span className="text-sm font-medium text-purple-700">View Analytics</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <div className="text-2xl mb-2">⚙️</div>
            <span className="text-sm font-medium text-orange-700">System Settings</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;