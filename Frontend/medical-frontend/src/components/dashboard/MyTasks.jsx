// src/components/dashboard/MyTasks.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const MyTasks = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuth();
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Review pending appointments",
      description: "Review and confirm 8 pending appointment requests from patients",
      priority: "High",
      status: "Pending",
      dueDate: "2025-09-30",
      category: "Medical",
      assignedBy: "System",
      createdAt: "2025-09-28"
    },
    {
      id: 2,
      title: "Update patient records",
      description: "Update medical records for discharged patients from last week",
      priority: "Medium",
      status: "In Progress",
      dueDate: "2025-10-02",
      category: "Administrative",
      assignedBy: "Dr. Smith",
      createdAt: "2025-09-27"
    },
    {
      id: 3,
      title: "Schedule maintenance",
      description: "Schedule system backup and maintenance for the weekend",
      priority: "Low",
      status: "Not Started",
      dueDate: "2025-10-05",
      category: "Technical",
      assignedBy: "IT Team",
      createdAt: "2025-09-26"
    },
    {
      id: 4,
      title: "Prepare monthly report",
      description: "Compile monthly statistics and performance report for administration",
      priority: "Medium",
      status: "In Progress",
      dueDate: "2025-10-01",
      category: "Reporting",
      assignedBy: "Admin",
      createdAt: "2025-09-25"
    },
    {
      id: 5,
      title: "Training session preparation",
      description: "Prepare materials for new staff training session next week",
      priority: "Medium",
      status: "Not Started",
      dueDate: "2025-10-03",
      category: "Training",
      assignedBy: "HR",
      createdAt: "2025-09-29"
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Not Started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'Pending' || task.status === 'Not Started';
    if (filter === 'progress') return task.status === 'In Progress';
    if (filter === 'completed') return task.status === 'Completed';
    if (filter === 'high') return task.priority === 'High';
    return true;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === 'priority') {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return a.title.localeCompare(b.title);
  });

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';
    return greeting;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.firstName || 'User'}!
            </h1>
            <p className="text-blue-100 mt-1">
              You have {tasks.filter(t => t.status !== 'Completed').length} active tasks to complete
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{tasks.length}</div>
            <div className="text-blue-100 text-sm">Total Tasks</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.priority === 'High').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.status === 'In Progress').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-blue-600 text-xl">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tasks.filter(t => t.status === 'Pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'Completed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-green-600 text-xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <span>➕</span>
            <span>Add New Task</span>
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Tasks ({sortedTasks.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {task.category}
                    </div>
                    <div>
                      <span className="font-medium">Assigned by:</span> {task.assignedBy}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {task.status !== 'Completed' && (
                    <>
                      {task.status === 'Not Started' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'In Progress')}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 text-sm"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'Completed')}
                          className="text-green-600 hover:text-green-800 px-3 py-1 rounded border border-green-300 hover:bg-green-50 text-sm"
                        >
                          Complete
                        </button>
                      )}
                      {task.status === 'Pending' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'In Progress')}
                          className="text-yellow-600 hover:text-yellow-800 px-3 py-1 rounded border border-yellow-300 hover:bg-yellow-50 text-sm"
                        >
                          Begin
                        </button>
                      )}
                    </>
                  )}
                  <button className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedTasks.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p>Try adjusting your filters or create a new task</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;