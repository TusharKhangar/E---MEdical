// src/components/dashboard/StaffForm.jsx
// Shared form for adding a doctor or an administrator. The new person gets an e-mail with a
// link to choose their own password, so no password is typed here.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/medicalService';
import { SPECIALIZATIONS } from '../../utils/constants';

const EMPTY = { firstName: '', lastName: '', email: '', gender: 'MALE', phoneNumber: '', specialization: '' };

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

const StaffForm = ({ kind, title, description, Icon, iconColour, submit, listPath }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const isDoctor = kind === 'doctor';

  if (!isAdmin()) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-600">Only administrators can add {kind}s.</p>
        </div>
      </motion.div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phoneNumber && !/^[1-9][0-9]{9}$/.test(formData.phoneNumber)) {
      toast.error('Please enter a 10-digit phone number');
      return;
    }
    if (isDoctor && !formData.specialization) {
      toast.error('Please choose a specialization');
      return;
    }
    setLoading(true);
    try {
      const body = { ...formData, phoneNumber: formData.phoneNumber || null };
      if (!isDoctor) delete body.specialization;
      const created = await submit(body);
      toast.success(`${created.firstName} ${created.lastName} added. They have been e-mailed a link to set a password.`);
      setFormData(EMPTY);
      navigate(listPath);
    } catch (error) {
      toast.error(errorMessage(error, `Failed to add ${kind}`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <span className="text-blue-600">Dashboard</span>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Icon className={`h-6 w-6 mr-2 ${iconColour}`} />
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClass}
                    placeholder="They will receive a set-password link here" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={inputClass}
                    placeholder="10 digits" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {isDoctor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                    <select name="specialization" value={formData.specialization} onChange={handleInputChange} required className={inputClass}>
                      <option value="">Select specialization</option>
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                The account starts disabled. The new {kind} receives an e-mail with a link to choose a password,
                which activates the account.
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button type="button" onClick={() => setFormData(EMPTY)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200">
                  Reset
                </button>
                <button type="submit" disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center disabled:opacity-50">
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <CheckCircleIcon className="h-4 w-4 mr-2" />}
                  {loading ? 'Saving...' : `Add ${isDoctor ? 'Doctor' : 'Administrator'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffForm;
