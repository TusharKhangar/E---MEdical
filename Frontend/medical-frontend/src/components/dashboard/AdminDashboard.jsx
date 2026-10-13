// Admin Dashboard Component
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { medicalService, errorMessage } from '../../services/medicalService';
import StatusBadge from '../common/StatusBadge';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      // Only the handful of rows the cards show, not the whole appointments table
      const [s, p, r] = await Promise.all([
        medicalService.getStats(),
        medicalService.searchAppointments({ status: 'PENDING', sort: 'soonest', size: 6 }),
        medicalService.searchAppointments({ sort: 'booked', size: 6 })
      ]);
      setStats(s);
      setPending(p.content);
      setRecent(r.content);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load the dashboard'));
    }
  };

  useEffect(() => { load(); }, []);

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

  const handleStatus = async (id, status) => {
    setBusyId(id);
    try {
      await medicalService.setAppointmentStatus(id, status);
      toast.success(`Appointment ${status.toLowerCase()}`);
      await load();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the appointment'));
    } finally {
      setBusyId(null);
    }
  };


  const cards = [
    { label: 'Patients', value: stats?.patients, note: 'Registered accounts', icon: '👥', colour: 'text-blue-600' },
    { label: 'Doctors', value: stats?.doctors, note: 'On staff', icon: '👨‍⚕️', colour: 'text-green-600' },
    { label: 'Appointments', value: stats?.appointments, note: `${stats?.pending ?? 0} awaiting confirmation`, icon: '📅', colour: 'text-purple-600' },
    { label: 'Completed', value: stats?.completed, note: `${stats?.cancelled ?? 0} cancelled`, icon: '✅', colour: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{getGreeting()}</h1>
            <p className="text-indigo-100 mt-1">System Administrator Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">🛡️</div>
            <div className="text-indigo-100 text-sm">Admin Control Panel</div>
          </div>
        </div>
      </motion.div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className={`text-2xl font-bold ${card.colour}`}>{card.value ?? '…'}</p>
                <p className="text-xs text-gray-500">{card.note}</p>
              </div>
              <div className="text-3xl">{card.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending appointments */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Awaiting Confirmation</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {stats?.pending ?? 0} pending
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {pending.length === 0 && (
              <div className="p-6 text-sm text-gray-500">Nothing waiting. All appointments are handled.</div>
            )}
            {pending.map((a) => (
              <div key={a.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{a.name}</h4>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{a.department || 'General'}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{a.doctorName} · {a.date} at {a.time}</p>
                    {a.description && <p className="text-xs text-gray-500">{a.description}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatus(a.id, 'CONFIRMED')}
                      disabled={busyId === a.id}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ Confirm
                    </button>
                    <button
                      onClick={() => handleStatus(a.id, 'CANCELLED')}
                      disabled={busyId === a.id}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                    >
                      ✗ Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent bookings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <Link to="/dashboard/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View all</Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.length === 0 && <div className="p-6 text-sm text-gray-500">No appointments yet.</div>}
            {recent.map((a) => (
              <div key={a.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">{a.name} → {a.doctorName}</p>
                  <p className="text-xs text-gray-500">{a.date} at {a.time}</p>
                </div>
                <StatusBadge status={a.status} />
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
          <Link to="/dashboard/add-doctor" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="text-2xl mb-2">👨‍⚕️</div>
            <span className="text-sm font-medium text-blue-700">Add Doctor</span>
          </Link>
          <Link to="/dashboard/doctor-details" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="text-2xl mb-2">🏥</div>
            <span className="text-sm font-medium text-green-700">Doctors</span>
          </Link>
          <Link to="/dashboard/users" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <span className="text-sm font-medium text-purple-700">Patients</span>
          </Link>
          <Link to="/dashboard/add-admin" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <div className="text-2xl mb-2">🛡️</div>
            <span className="text-sm font-medium text-orange-700">Add Admin</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
