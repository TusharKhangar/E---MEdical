// src/components/dashboard/MyProfile.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  PencilIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { medicalService, errorMessage } from '../../services/medicalService';
import { SPECIALIZATIONS } from '../../utils/constants';

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

const MyProfile = () => {
  const { user, updateProfile, isDoctor } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', gender: '', specialization: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    medicalService.getProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phoneNumber: p.phoneNumber || '',
          gender: p.gender || '',
          specialization: p.specialization || ''
        });
      })
      .catch((error) => toast.error(errorMessage(error, 'Could not load your profile')));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phoneNumber && !/^[1-9][0-9]{9}$/.test(form.phoneNumber)) {
      toast.error('Please enter a 10-digit phone number');
      return;
    }
    setLoading(true);
    const result = await updateProfile(form);
    setLoading(false);
    if (result.success) {
      setProfile(prev => ({ ...prev, ...result.user }));
      setIsEditing(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('The new passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const message = await medicalService.changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success(message || 'Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (error) {
      toast.error(errorMessage(error, 'Could not change your password'));
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleBadge = () => {
    const role = profile?.role || user?.role || 'ROLE_USER';
    let colorClass = 'bg-green-100 text-green-800';
    let Icon = UserCircleIcon;
    if (role === 'ROLE_ADMIN') {
      colorClass = 'bg-red-100 text-red-800';
      Icon = ShieldCheckIcon;
    } else if (role === 'ROLE_DOCTOR') {
      colorClass = 'bg-blue-100 text-blue-800';
    }
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        <Icon className="h-4 w-4 mr-1" />
        {role === 'ROLE_USER' ? 'PATIENT' : role.replace('ROLE_', '')}
      </div>
    );
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <span className="text-blue-600">Dashboard</span>
        <span className="mx-2">/</span>
        <span>My Profile</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-12 w-12" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {isDoctor() ? 'Dr. ' : ''}{profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-blue-100 mb-2">{profile.email}</p>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input type="text" name="firstName" value={form.firstName} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input type="text" name="lastName" value={form.lastName} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} className={inputClass} placeholder="10 digits" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleInputChange} className={inputClass}>
                      <option value="">Prefer not to say</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  {isDoctor() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <select name="specialization" value={form.specialization} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select specialization</option>
                        {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center disabled:opacity-50">
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <CheckCircleIcon className="h-4 w-4 mr-2" />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        <p className="font-medium">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{profile.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <UserCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="font-medium">{profile.gender || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Last seen</p>
                        <p className="font-medium">{profile.lastseen ? profile.lastseen.replace('T', ' ') : 'Now'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {isDoctor() && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Specialization:</span>
                        <span className="font-medium">{profile.specialization || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2 text-gray-500" />
              Change Password
            </h3>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current password</label>
              <input type="password" autoComplete="current-password" required className={inputClass}
                value={passwords.currentPassword} onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
              <input type="password" autoComplete="new-password" required minLength={8} className={inputClass}
                value={passwords.newPassword} onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm new password</label>
              <input type="password" autoComplete="new-password" required className={inputClass}
                value={passwords.confirm} onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" disabled={changingPassword}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition duration-200 disabled:opacity-50">
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default MyProfile;
