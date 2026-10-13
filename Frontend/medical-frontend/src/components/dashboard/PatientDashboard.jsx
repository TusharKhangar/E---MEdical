// src/components/dashboard/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { medicalService, errorMessage } from '../../services/medicalService';

const HEALTH_TIPS = [
  { id: 1, title: 'Stay Hydrated', tip: 'Drink at least 8 glasses of water daily to maintain good health.', icon: '💧' },
  { id: 2, title: 'Regular Exercise', tip: 'Aim for 30 minutes of moderate exercise 5 times a week.', icon: '🏃‍♂️' },
  { id: 3, title: 'Sleep Well', tip: 'Seven to nine hours of sleep keeps your immune system strong.', icon: '😴' }
];

const todayIso = () => new Date().toISOString().split('T')[0];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medicalService.getMyAppointments()
      .then(setAppointments)
      .catch((error) => toast.error(errorMessage(error, 'Could not load your appointments')))
      .finally(() => setLoading(false));
  }, []);

  const today = todayIso();
  const upcoming = appointments
    .filter(a => a.date >= today && (a.status === 'PENDING' || a.status === 'CONFIRMED'))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = appointments
    .filter(a => a.date < today || a.status === 'COMPLETED' || a.status === 'CANCELLED')
    .slice(0, 5);
  const next = upcoming[0];

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      const updated = await medicalService.cancelMyAppointment(id);
      setAppointments(prev => prev.map(a => (a.id === id ? updated : a)));
      toast.success('Appointment cancelled');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not cancel the appointment'));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';
    return greeting;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-700 bg-green-100 border-green-300';
      case 'PENDING': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'COMPLETED': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'CANCELLED': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const AppointmentRow = ({ appointment, cancellable }) => (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">{appointment.doctorName}</h4>
            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(appointment.status)}`}>
              {appointment.status.toLowerCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{appointment.department || 'General'}</p>
          <p className="text-sm text-gray-700 mb-2">
            {formatDate(appointment.date)} at {appointment.time}
          </p>
          {appointment.description && (
            <p className="text-xs text-gray-500">{appointment.description}</p>
          )}
        </div>
        {cancellable && (
          <button onClick={() => handleCancel(appointment.id)} className="text-red-600 hover:text-red-800 text-xs">
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.firstName || 'Patient'}!
            </h1>
            <p className="text-blue-100 mt-1">
              Welcome to your health dashboard
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-2">🏥</div>
            <div className="text-blue-100 text-sm">Your Health Hub</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Appointment</p>
              <p className="text-lg font-bold text-blue-600">
                {next ? `${formatDate(next.date)}` : 'None'}
              </p>
              <p className="text-xs text-gray-500">
                {next ? `${next.time} with ${next.doctorName}` : 'Schedule one'}
              </p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-lg font-bold text-green-600">{upcoming.length}</p>
              <p className="text-xs text-gray-500">Booked visits</p>
            </div>
            <div className="text-2xl">🗓️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-lg font-bold text-purple-600">
                {appointments.filter(a => a.status === 'COMPLETED').length}
              </p>
              <p className="text-xs text-gray-500">Past visits</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Awaiting confirmation</p>
              <p className="text-lg font-bold text-orange-600">
                {appointments.filter(a => a.status === 'PENDING').length}
              </p>
              <p className="text-xs text-gray-500">Pending with the doctor</p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <Link to="/dashboard/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : upcoming.length > 0 ? (
              upcoming.slice(0, 5).map(appointment => (
                <AppointmentRow key={appointment.id} appointment={appointment} cancellable />
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-gray-500 mb-3">No upcoming appointments</p>
                <Link to="/dashboard/make-appointment" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Schedule Appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Past visits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Visits</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {past.length > 0 ? (
              past.map(appointment => (
                <AppointmentRow key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No past visits yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Tips */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Health Tips</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {HEALTH_TIPS.map(tip => (
              <div key={tip.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-lg">{tip.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{tip.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dashboard/make-appointment" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">📅</div>
              <span className="text-sm font-medium text-blue-700">Book Appointment</span>
            </Link>
            <Link to="/dashboard/appointments" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">🗓️</div>
              <span className="text-sm font-medium text-green-700">My Appointments</span>
            </Link>
            <Link to="/doctors" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">👨‍⚕️</div>
              <span className="text-sm font-medium text-purple-700">Find a Doctor</span>
            </Link>
            <Link to="/dashboard/my-profile" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <div className="text-2xl mb-2">👤</div>
              <span className="text-sm font-medium text-orange-700">My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
