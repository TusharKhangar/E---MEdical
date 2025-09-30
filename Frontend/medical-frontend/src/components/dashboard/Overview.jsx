// src/components/dashboard/Overview.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Overview = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuth();

  const [stats, setStats] = useState({
    totalRevenue: 125430,
    revenueGrowth: 12.5,
    newPatients: 238,
    patientGrowth: 8.2,
    totalAppointments: 1420,
    appointmentGrowth: 5.7,
    satisfactionRate: 98.2,
    satisfactionGrowth: 2.1,
    doctorsOnline: 15,
    totalDoctors: 18,
    activeBeds: 45,
    totalBeds: 50,
    emergencyCases: 8,
    criticalCases: 3
  });

  const [chartData, setChartData] = useState({
    dailyAppointments: [45, 52, 38, 67, 73, 51, 42],
    monthlyRevenue: [98000, 105000, 112000, 118000, 125430],
    departmentStats: [
      { name: 'Cardiology', patients: 45, revenue: 23000 },
      { name: 'Neurology', patients: 32, revenue: 18500 },
      { name: 'Orthopedics', patients: 28, revenue: 15800 },
      { name: 'Pediatrics', patients: 52, revenue: 12300 },
      { name: 'Emergency', patients: 81, revenue: 35200 }
    ]
  });

  const [timeRange, setTimeRange] = useState('30days');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? '📈' : '📉';
  };

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        doctorsOnline: Math.min(18, prev.doctorsOnline + (Math.random() > 0.5 ? 1 : -1)),
        emergencyCases: Math.max(0, prev.emergencyCases + (Math.random() > 0.7 ? 1 : 0)),
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Revenue</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-lg">{getGrowthIcon(stats.revenueGrowth)}</span>
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(stats.revenueGrowth)}`}>
                  {formatPercent(stats.revenueGrowth)} from last month
                </span>
              </div>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">New Patients</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {stats.newPatients.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-lg">{getGrowthIcon(stats.patientGrowth)}</span>
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(stats.patientGrowth)}`}>
                  {formatPercent(stats.patientGrowth)} from last month
                </span>
              </div>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Total Appointments</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {stats.totalAppointments.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-lg">{getGrowthIcon(stats.appointmentGrowth)}</span>
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(stats.appointmentGrowth)}`}>
                  {formatPercent(stats.appointmentGrowth)} from last month
                </span>
              </div>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Satisfaction Rate</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {stats.satisfactionRate}%
              </p>
              <div className="flex items-center mt-2">
                <span className="text-lg">{getGrowthIcon(stats.satisfactionGrowth)}</span>
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(stats.satisfactionGrowth)}`}>
                  {formatPercent(stats.satisfactionGrowth)} from last month
                </span>
              </div>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Doctors Online</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.doctorsOnline}/{stats.totalDoctors}
              </p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Beds</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalBeds - stats.activeBeds}/{stats.totalBeds}
              </p>
            </div>
            <div className="text-lg">🏥</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emergency Cases</p>
              <p className="text-xl font-bold text-orange-600">{stats.emergencyCases}</p>
            </div>
            <div className="text-lg">🚨</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Cases</p>
              <p className="text-xl font-bold text-red-600">{stats.criticalCases}</p>
            </div>
            <div className="text-lg">⚠️</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Appointments Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Appointments</h3>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          <div className="space-y-3">
            {chartData.dailyAppointments.map((appointments, index) => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const maxAppointments = Math.max(...chartData.dailyAppointments);
              const width = (appointments / maxAppointments) * 100;

              return (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-8">
                    {days[index]}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {appointments}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {chartData.departmentStats.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{dept.name}</h4>
                  <p className="text-sm text-gray-600">{dept.patients} patients</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(dept.revenue)}
                  </p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(dept.revenue / 40000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">New appointment</span> scheduled with Dr. Smith
                </p>
                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Patient record</span> updated by Dr. Johnson
                </p>
                <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">System backup</span> completed successfully
                </p>
                <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;