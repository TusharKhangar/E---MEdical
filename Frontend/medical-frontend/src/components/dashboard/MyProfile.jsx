// src/components/dashboard/MyProfile.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const MyProfile = () => {
  const { user, updateProfile, isAdmin, isDoctor, isPatient } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    address: '',
    dateOfBirth: '',
    bio: '',
    emergencyContact: ''
  });

  // Mock user profile data based on role
  const mockUserData = {
    id: user?.id || 1,
    firstName: user?.firstName || 'Soumyadip',
    lastName: user?.lastName || 'Chowdhury',
    email: user?.email || 'soumyadip.note@gmail.com',
    phone: '+91 9876543210',
    gender: 'MALE',
    address: 'Kolkata, West Bengal, India',
    dateOfBirth: '1990-05-15',
    bio: isDoctor() ? 'Experienced medical practitioner dedicated to providing excellent patient care.' : 
         isAdmin() ? 'System administrator ensuring smooth operations of the medical platform.' :
         'Patient committed to maintaining good health and regular medical checkups.',
    emergencyContact: '+91 9876543211',
    role: user?.role || 'ROLE_USER',
    joinedDate: '2019-01-15',
    lastSeen: 'Now',
    profilePicture: null,
    // Doctor specific fields
    ...(isDoctor() && {
      specialization: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology)',
      experience: 15,
      consultationFee: 1500,
      licenseNumber: 'MH12345',
      rating: 4.8,
      patientsCount: 245
    }),
    // Patient specific fields
    ...(isPatient() && {
      bloodGroup: 'A+',
      allergies: 'None',
      medicalHistory: 'No significant medical history',
      insurance: 'Health Plus Premium'
    })
  };

  useEffect(() => {
    // Initialize profile data
    setProfileData({
      firstName: mockUserData.firstName,
      lastName: mockUserData.lastName,
      email: mockUserData.email,
      phone: mockUserData.phone,
      gender: mockUserData.gender,
      address: mockUserData.address,
      dateOfBirth: mockUserData.dateOfBirth,
      bio: mockUserData.bio,
      emergencyContact: mockUserData.emergencyContact
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update profile via context
      if (updateProfile) {
        await updateProfile(profileData);
      }
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      firstName: mockUserData.firstName,
      lastName: mockUserData.lastName,
      email: mockUserData.email,
      phone: mockUserData.phone,
      gender: mockUserData.gender,
      address: mockUserData.address,
      dateOfBirth: mockUserData.dateOfBirth,
      bio: mockUserData.bio,
      emergencyContact: mockUserData.emergencyContact
    });
    setIsEditing(false);
  };

  const getRoleBadge = () => {
    const role = mockUserData.role;
    let colorClass = 'bg-gray-100 text-gray-800';
    let icon = UserCircleIcon;
    
    if (role === 'ROLE_ADMIN' || role === 'ROLE_SUPER_ADMIN') {
      colorClass = 'bg-red-100 text-red-800';
      icon = ShieldCheckIcon;
    } else if (role === 'ROLE_DOCTOR') {
      colorClass = 'bg-blue-100 text-blue-800';
    } else {
      colorClass = 'bg-green-100 text-green-800';
    }

    const IconComponent = icon;
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        <IconComponent className="h-4 w-4 mr-1" />
        {role.replace('ROLE_', '')}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <span className="text-blue-600">Dashboard</span>
        <span className="mx-2">/</span>
        <span>My Profile</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="h-12 w-12" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white text-gray-600 p-1 rounded-full shadow-sm">
                    <CameraIcon className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {mockUserData.firstName} {mockUserData.lastName}
                  </h1>
                  <p className="text-blue-100 mb-2">{mockUserData.email}</p>
                  {getRoleBadge()}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              /* View Profile */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserCircleIcon className="h-5 w-5 mr-2" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{mockUserData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{mockUserData.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium">{mockUserData.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="font-medium">{mockUserData.dateOfBirth}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role-specific Information */}
                  {isDoctor() && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Specialization:</span>
                          <span className="font-medium">{mockUserData.specialization}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Qualification:</span>
                          <span className="font-medium">{mockUserData.qualification}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">{mockUserData.experience} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">License:</span>
                          <span className="font-medium">{mockUserData.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rating:</span>
                          <span className="font-medium flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            {mockUserData.rating}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Patients:</span>
                          <span className="font-medium">{mockUserData.patientsCount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isPatient() && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Blood Group:</span>
                          <span className="font-medium">{mockUserData.bloodGroup}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Allergies:</span>
                          <span className="font-medium">{mockUserData.allergies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Insurance:</span>
                          <span className="font-medium">{mockUserData.insurance}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                    <p className="text-gray-600 leading-relaxed">{mockUserData.bio}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-medium">{mockUserData.joinedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Seen:</span>
                        <span className="font-medium">{mockUserData.lastSeen}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Emergency Contact:</span>
                        <span className="font-medium">{mockUserData.emergencyContact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {isDoctor() ? mockUserData.patientsCount : 
                           isPatient() ? '12' : '1,234'}
                        </p>
                        <p className="text-gray-600">
                          {isDoctor() ? 'Patients' : 
                           isPatient() ? 'Appointments' : 'Records'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {isDoctor() ? mockUserData.rating : 
                           isPatient() ? '5' : '99.8%'}
                        </p>
                        <p className="text-gray-600">
                          {isDoctor() ? 'Rating' : 
                           isPatient() ? 'Completed' : 'Uptime'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MyProfile;