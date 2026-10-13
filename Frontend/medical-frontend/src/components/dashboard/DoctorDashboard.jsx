// Doctor Dashboard Component
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { medicalService, errorMessage } from '../../services/medicalService';

const todayIso = () => new Date().toISOString().split('T')[0];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = () => medicalService.getDoctorAppointments()
    .then(setAppointments)
    .catch((error) => toast.error(errorMessage(error, 'Could not load your schedule')));

  useEffect(() => { load(); }, []);

  const today = todayIso();
  const active = (a) => a.status === 'PENDING' || a.status === 'CONFIRMED';
  const todays = appointments.filter(a => a.date === today && a.status !== 'CANCELLED')
    .sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = appointments.filter(a => a.date > today && active(a))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const pending = appointments.filter(a => a.status === 'PENDING');
  const patients = new Set(appointments.map(a => a.email)).size;
  const nextToday = todays.find(a => active(a));

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
      case 'COMPLETED':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'CONFIRMED':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await medicalService.setDoctorAppointmentStatus(id, status);
      toast.success(`Appointment ${status.toLowerCase()}`);
      await load();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the appointment'));
    } finally {
      setBusyId(null);
    }
  };

  const Actions = ({ a }) => (
    <div className="flex space-x-2">
      {a.status === 'PENDING' && (
        <button onClick={() => setStatus(a.id, 'CONFIRMED')} disabled={busyId === a.id}
          className="text-green-600 hover:text-green-800 text-xs bg-green-50 px-2 py-1 rounded disabled:opacity-50">
          Confirm
        </button>
      )}
      {a.status === 'CONFIRMED' && (
        <button onClick={() => setStatus(a.id, 'COMPLETED')} disabled={busyId === a.id}
          className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-2 py-1 rounded disabled:opacity-50">
          Complete
        </button>
      )}
      {active(a) && (
        <button onClick={() => setStatus(a.id, 'CANCELLED')} disabled={busyId === a.id}
          className="text-red-600 hover:text-red-800 text-xs bg-red-50 px-2 py-1 rounded disabled:opacity-50">
          Cancel
        </button>
      )}
    </div>
  );

  const Row = ({ a, showDate }) => (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">{a.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(a.status)}`}>
              {a.status.toLowerCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{a.description || 'No reason given'}</p>
          <p className="text-sm text-gray-700">{showDate ? `${a.date} · ` : ''}{a.time} · {a.email}</p>
        </div>
        <Actions a={a} />
      </div>
    </div>
  );

  const stats = [
    { label: 'My Patients', value: patients, note: 'People who booked you', icon: '🏥', colour: 'text-blue-600' },
    { label: "Today's Schedule", value: todays.length, note: 'Appointments today', icon: '📅', colour: 'text-green-600' },
    { label: 'To Confirm', value: pending.length, note: 'Awaiting your reply', icon: '📋', colour: 'text-orange-600' },
    { label: 'Upcoming', value: upcoming.length, note: 'After today', icon: '🗓️', colour: 'text-purple-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Doctor Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{getGreeting()}</h1>
            <p className="text-green-100 mt-1">{user?.specialization || 'Your Medical Practice Dashboard'}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">👨‍⚕️</div>
            <div className="text-green-100 text-sm">
              Next: {nextToday ? `${nextToday.time} · ${nextToday.name}` : 'nothing more today'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Doctor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s, index) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{s.label}</p>
                <p className={`text-2xl font-bold ${s.colour}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.note}</p>
              </div>
              <div className="text-3xl">{s.icon}</div>
            </div>
          </motion.div>
        ))}
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
              <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h3>
              <Link to="/dashboard/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Full Schedule
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {todays.length === 0 && <div className="p-6 text-sm text-gray-500">No appointments today.</div>}
            {todays.map((a) => <Row key={a.id} a={a} />)}
          </div>
        </motion.div>

        {/* Upcoming */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {upcoming.length === 0 && <div className="p-6 text-sm text-gray-500">Nothing booked after today.</div>}
            {upcoming.slice(0, 6).map((a) => <Row key={a.id} a={a} showDate />)}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
