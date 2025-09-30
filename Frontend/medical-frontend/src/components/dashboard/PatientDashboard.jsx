// src/components/dashboard/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();

  const [patientData, setPatientData] = useState({
    upcomingAppointments: [
      {
        id: 1,
        doctor: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        date: "2025-10-02",
        time: "10:30 AM",
        type: "Follow-up",
        location: "Room 204, Cardiology Wing",
        status: "confirmed"
      },
      {
        id: 2,
        doctor: "Dr. Michael Chen",
        specialty: "Dermatologist",
        date: "2025-10-05",
        time: "2:15 PM",
        type: "Consultation",
        location: "Room 105, Dermatology",
        status: "pending"
      }
    ],
    recentTests: [
      {
        id: 1,
        test: "Blood Work Panel",
        date: "2025-09-25",
        status: "completed",
        results: "Normal",
        doctor: "Dr. Sarah Johnson"
      },
      {
        id: 2,
        test: "Chest X-Ray",
        date: "2025-09-28",
        status: "completed",
        results: "Pending Review",
        doctor: "Dr. Michael Brown"
      },
      {
        id: 3,
        test: "ECG",
        date: "2025-10-01",
        status: "scheduled",
        results: "Not yet done",
        doctor: "Dr. Sarah Johnson"
      }
    ],
    currentMedications: [
      {
        id: 1,
        name: "Lisinopril",
        dosage: "10mg daily",
        prescribedBy: "Dr. Sarah Johnson",
        startDate: "2025-09-15",
        refillsLeft: 2,
        nextRefill: "2025-11-15"
      },
      {
        id: 2,
        name: "Metformin",
        dosage: "500mg twice daily",
        prescribedBy: "Dr. Robert Wilson",
        startDate: "2025-08-20",
        refillsLeft: 0,
        nextRefill: "Needs renewal"
      }
    ],
    healthMetrics: {
      lastVisit: "2025-09-25",
      bloodPressure: "120/80",
      weight: "165 lbs",
      height: "5'8\"",
      bmi: "25.1",
      bloodType: "O+"
    },
    unreadMessages: 2,
    pendingBills: [
      {
        id: 1,
        date: "2025-09-25",
        description: "Consultation - Dr. Johnson",
        amount: 150,
        dueDate: "2025-10-25",
        status: "pending"
      }
    ]
  });

  const [healthTips] = useState([
    {
      id: 1,
      title: "Stay Hydrated",
      tip: "Drink at least 8 glasses of water daily to maintain good health.",
      icon: "💧"
    },
    {
      id: 2,
      title: "Regular Exercise",
      tip: "Aim for 30 minutes of moderate exercise 5 times a week.",
      icon: "🏃‍♂️"
    },
    {
      id: 3,
      title: "Medication Reminder",
      tip: "Take your Metformin prescription - it's time for renewal.",
      icon: "💊"
    }
  ]);

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
      case 'confirmed': return 'text-green-700 bg-green-100 border-green-300';
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'completed': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Appointment</p>
              <p className="text-lg font-bold text-blue-600">
                {patientData.upcomingAppointments.length > 0 ? 'Oct 2' : 'None'}
              </p>
              <p className="text-xs text-gray-500">
                {patientData.upcomingAppointments.length > 0 ? 'Dr. Johnson' : 'Schedule one'}
              </p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Medications</p>
              <p className="text-lg font-bold text-green-600">{patientData.currentMedications.length}</p>
              <p className="text-xs text-gray-500">Current prescriptions</p>
            </div>
            <div className="text-2xl">💊</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Test Results</p>
              <p className="text-lg font-bold text-purple-600">
                {patientData.recentTests.filter(test => test.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-500">Ready to view</p>
            </div>
            <div className="text-2xl">🔬</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-lg font-bold text-orange-600">{patientData.unreadMessages}</p>
              <p className="text-xs text-gray-500">Unread messages</p>
            </div>
            <div className="text-2xl">💬</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {patientData.upcomingAppointments.length > 0 ? (
              patientData.upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{appointment.doctor}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{appointment.specialty}</p>
                      <p className="text-sm text-gray-700 mb-2">
                        {formatDate(appointment.date)} at {appointment.time}
                      </p>
                      <p className="text-xs text-gray-500">{appointment.location}</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button className="text-blue-600 hover:text-blue-800 text-xs">Reschedule</button>
                      <button className="text-red-600 hover:text-red-800 text-xs">Cancel</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-gray-500 mb-3">No upcoming appointments</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Schedule Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Test Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tests</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {patientData.recentTests.map(test => (
              <div key={test.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{test.test}</h4>
                    <p className="text-sm text-gray-600 mb-1">Ordered by {test.doctor}</p>
                    <p className="text-sm text-gray-700">
                      {formatDate(test.date)} - {test.results}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                    {test.status === 'completed' && test.results !== 'Pending Review' && (
                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                        View Results
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Medications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {patientData.currentMedications.map(medication => (
              <div key={medication.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{medication.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">{medication.dosage}</p>
                    <p className="text-sm text-gray-700 mb-2">
                      Prescribed by {medication.prescribedBy}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Refills left: {medication.refillsLeft}</span>
                      <span>Next refill: {medication.nextRefill}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {medication.refillsLeft === 0 ? (
                      <button className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                        Request Refill
                      </button>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                        Refill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Profile & Tips */}
        <div className="space-y-6">
          {/* Health Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Health Profile</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <p className="text-lg font-semibold text-gray-900">{patientData.healthMetrics.bloodPressure}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="text-lg font-semibold text-gray-900">{patientData.healthMetrics.weight}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">BMI</p>
                  <p className="text-lg font-semibold text-gray-900">{patientData.healthMetrics.bmi}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Blood Type</p>
                  <p className="text-lg font-semibold text-gray-900">{patientData.healthMetrics.bloodType}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Last updated: {formatDate(patientData.healthMetrics.lastVisit)}
              </p>
            </div>
          </div>

          {/* Health Tips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Health Tips</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {healthTips.map(tip => (
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
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="text-2xl mb-2">📅</div>
            <span className="text-sm font-medium text-blue-700">Book Appointment</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="text-2xl mb-2">💊</div>
            <span className="text-sm font-medium text-green-700">Refill Medication</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="text-2xl mb-2">💬</div>
            <span className="text-sm font-medium text-purple-700">Message Doctor</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <div className="text-2xl mb-2">💳</div>
            <span className="text-sm font-medium text-orange-700">Pay Bills</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;