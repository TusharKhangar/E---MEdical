// src/components/dashboard/Calendar.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Calendar = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      title: "Cardiology Consultation",
      patient: "John Doe",
      doctor: "Dr. Smith",
      date: "2025-09-30",
      time: "10:00",
      duration: 30,
      type: "consultation",
      status: "confirmed",
      department: "Cardiology"
    },
    {
      id: 2,
      title: "Follow-up Appointment",
      patient: "Sarah Johnson",
      doctor: "Dr. Brown",
      date: "2025-09-30",
      time: "14:30",
      duration: 20,
      type: "follow-up",
      status: "pending",
      department: "Neurology"
    },
    {
      id: 3,
      title: "Emergency Consultation",
      patient: "Mike Wilson",
      doctor: "Dr. Davis",
      date: "2025-10-01",
      time: "09:00",
      duration: 45,
      type: "emergency",
      status: "confirmed",
      department: "Emergency"
    },
    {
      id: 4,
      title: "Routine Checkup",
      patient: "Lisa Anderson",
      doctor: "Dr. Wilson",
      date: "2025-10-01",
      time: "11:00",
      duration: 15,
      type: "checkup",
      status: "confirmed",
      department: "General Medicine"
    },
    {
      id: 5,
      title: "Lab Results Review",
      patient: "Robert Taylor",
      doctor: "Dr. Johnson",
      date: "2025-10-02",
      time: "16:00",
      duration: 25,
      type: "review",
      status: "pending",
      department: "Laboratory"
    }
  ]);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'consultation': return '🩺';
      case 'follow-up': return '🔄';
      case 'emergency': return '🚨';
      case 'checkup': return '✅';
      case 'review': return '📋';
      default: return '📅';
    }
  };

  const getCurrentMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDatePointer = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(currentDatePointer));
      currentDatePointer.setDate(currentDatePointer.getDate() + 1);
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(app => app.date === dateString);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const todayAppointments = getAppointmentsForDate(new Date());
  const upcomingAppointments = appointments
    .filter(app => new Date(app.date) >= new Date())
    .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">
            Manage appointments and schedule
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-sm ${
                viewMode === 'month' ? 'bg-white shadow-sm' : ''
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-sm ${
                viewMode === 'week' ? 'bg-white shadow-sm' : ''
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-sm ${
                viewMode === 'day' ? 'bg-white shadow-sm' : ''
              }`}
            >
              Day
            </button>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <span>➕</span>
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Calendar Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {getCurrentMonthDays().map((date, index) => {
                  const dayAppointments = getAppointmentsForDate(date);

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 min-h-[80px] cursor-pointer rounded-lg border transition-colors ${
                        isToday(date)
                          ? 'bg-blue-50 border-blue-200'
                          : isSelectedDate(date)
                          ? 'bg-blue-100 border-blue-300'
                          : 'border-gray-100 hover:bg-gray-50'
                      } ${!isCurrentMonth(date) ? 'opacity-40' : ''}`}
                    >
                      <div className={`text-sm font-medium ${
                        isToday(date) ? 'text-blue-700' :
                        !isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>

                      {dayAppointments.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayAppointments.slice(0, 2).map(appointment => (
                            <div
                              key={appointment.id}
                              className={`text-xs p-1 rounded border ${getStatusColor(appointment.status)}`}
                            >
                              <div className="flex items-center space-x-1">
                                <span>{getTypeIcon(appointment.type)}</span>
                                <span className="truncate">
                                  {formatTime(appointment.time)}
                                </span>
                              </div>
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Today's Appointments</h3>
              <p className="text-sm text-gray-500">{todayAppointments.length} appointments</p>
            </div>
            <div className="divide-y divide-gray-100">
              {todayAppointments.length > 0 ? (
                todayAppointments.map(appointment => (
                  <div key={appointment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">{getTypeIcon(appointment.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {appointment.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.patient}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {formatTime(appointment.time)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-3xl mb-2">📅</div>
                  <p>No appointments today</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Upcoming</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="text-sm">{getTypeIcon(appointment.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appointment.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at {formatTime(appointment.time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total This Week</span>
                <span className="font-semibold text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="font-semibold text-green-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold text-blue-600">15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;