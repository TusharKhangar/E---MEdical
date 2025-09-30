// src/components/dashboard/AdminDetails.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../common/DataTable';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const AdminDetails = () => {
  const { canAccessAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'MALE',
    phone: '',
    address: '',
    permissions: {
      manageUsers: true,
      manageDoctors: true,
      manageAppointments: true,
      viewReports: true,
      systemSettings: true
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPermissions, setShowPermissions] = useState({});

  // Mock admin data
  const mockAdmins = [
    {
      id: 1,
      firstName: 'Soumyadip',
      lastName: 'Chowdhury',
      email: 'soumyadip.note@gmail.com',
      gender: 'MALE',
      phone: '+91 9876543210',
      address: 'Kolkata, West Bengal',
      role: 'ROLE_ADMIN',
      status: 'Active',
      lastSeen: 'Tue Aug 06 17:18:10 IST 2019',
      joinedDate: '2019-01-15',
      permissions: {
        manageUsers: true,
        manageDoctors: true,
        manageAppointments: true,
        viewReports: true,
        systemSettings: true
      }
    },
    {
      id: 2,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@remedic.com',
      gender: 'MALE',
      phone: '+91 9876543211',
      address: 'Delhi, India',
      role: 'ROLE_ADMIN',
      status: 'Active',
      lastSeen: 'Wed Mar 13 14:30:00 IST 2024',
      joinedDate: '2023-06-01',
      permissions: {
        manageUsers: true,
        manageDoctors: true,
        manageAppointments: false,
        viewReports: true,
        systemSettings: false
      }
    },
    {
      id: 3,
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@remedic.com',
      gender: 'FEMALE',
      phone: '+91 9876543212',
      address: 'Mumbai, Maharashtra',
      role: 'ROLE_SUPER_ADMIN',
      status: 'Active',
      lastSeen: 'Thu Mar 14 16:45:00 IST 2024',
      joinedDate: '2019-01-01',
      permissions: {
        manageUsers: true,
        manageDoctors: true,
        manageAppointments: true,
        viewReports: true,
        systemSettings: true
      }
    }
  ];

  if (!canAccessAdmin()) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-600">You don't have permission to view admin details.</p>
        </div>
      </motion.div>
    );
  }

  useEffect(() => {
    setAdmins(mockAdmins);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        const updatedAdmins = admins.map(admin => 
          admin.id === editingId ? { ...admin, ...formData } : admin
        );
        setAdmins(updatedAdmins);
        toast.success('Admin updated successfully');
        setIsEditing(false);
        setEditingId(null);
      } else {
        const newAdmin = {
          id: admins.length + 1,
          ...formData,
          role: 'ROLE_ADMIN',
          status: 'Active',
          lastSeen: new Date().toLocaleString(),
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setAdmins(prev => [...prev, newAdmin]);
        toast.success('Admin added successfully');
      }
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        gender: 'MALE',
        phone: '',
        address: '',
        permissions: {
          manageUsers: true,
          manageDoctors: true,
          manageAppointments: true,
          viewReports: true,
          systemSettings: true
        }
      });
      setShowForm(false);
    } catch (error) {
      toast.error('Failed to save admin');
    }
  };

  const handleEdit = (admin) => {
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      gender: admin.gender,
      phone: admin.phone || '',
      address: admin.address || '',
      permissions: admin.permissions || {
        manageUsers: true,
        manageDoctors: true,
        manageAppointments: true,
        viewReports: true,
        systemSettings: true
      }
    });
    setIsEditing(true);
    setEditingId(admin.id);
    setShowForm(true);
  };

  const handleDelete = (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));
      toast.success('Admin deleted successfully');
    }
  };

  const togglePermissions = (adminId) => {
    setShowPermissions(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  const cancelEdit = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      gender: 'MALE',
      phone: '',
      address: '',
      permissions: {
        manageUsers: true,
        manageDoctors: true,
        manageAppointments: true,
        viewReports: true,
        systemSettings: true
      }
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'firstName', title: 'First Name' },
    { key: 'lastName', title: 'Last Name' },
    { key: 'email', title: 'Email' },
    { key: 'phone', title: 'Phone' },
    { 
      key: 'role', 
      title: 'Role',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'ROLE_SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.replace('ROLE_', '')}
        </span>
      )
    },
    { 
      key: 'status', 
      title: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'joinedDate', title: 'Joined Date' },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => togglePermissions(row.id)}
            className="text-purple-600 hover:text-purple-800 p-1 rounded transition-colors"
            title="View Permissions"
          >
            <KeyIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const stats = [
    { name: 'Total Admins', value: admins.length, icon: ShieldCheckIcon, color: 'red' },
    { name: 'Active Admins', value: admins.filter(a => a.status === 'Active').length, icon: CheckCircleIcon, color: 'green' },
    { name: 'Super Admins', value: admins.filter(a => a.role === 'ROLE_SUPER_ADMIN').length, icon: UsersIcon, color: 'purple' },
    { name: 'Regular Admins', value: admins.filter(a => a.role === 'ROLE_ADMIN').length, icon: UsersIcon, color: 'blue' }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <span className="text-blue-600">Dashboard</span>
          <span className="mx-2">/</span>
          <span>Admin Details</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Permissions Modal */}
      {Object.keys(showPermissions).some(key => showPermissions[key]) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2" />
              Admin Permissions
            </h3>
            {admins
              .filter(admin => showPermissions[admin.id])
              .map(admin => (
                <div key={admin.id} className="space-y-3">
                  <h4 className="font-medium">{admin.firstName} {admin.lastName}</h4>
                  {Object.entries(admin.permissions || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {value ? 'Allowed' : 'Denied'}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPermissions({})}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Section */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-red-600" />
                  {isEditing ? 'Edit Admin' : 'Add New Admin'}
                </h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name:
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name:
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone:
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender:
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address:
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions:
                  </label>
                  <div className="space-y-2">
                    {Object.entries(formData.permissions).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handlePermissionChange(key)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update' : 'Add Admin'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Table Section */}
        <div className={showForm ? "lg:col-span-8" : "lg:col-span-12"}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <DataTable
                data={admins}
                columns={columns}
                title="Admin Management"
                searchable={true}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetails;