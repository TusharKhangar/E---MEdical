// src/components/dashboard/AccountTable.jsx
// Shared admin screen for listing patients, doctors or administrators, with an enable/disable switch.
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { medicalService, errorMessage } from '../../services/medicalService';
import DataTable from '../common/DataTable';

const ROLE_BADGE = {
  ROLE_ADMIN: 'bg-red-100 text-red-800',
  ROLE_DOCTOR: 'bg-blue-100 text-blue-800',
  ROLE_USER: 'bg-green-100 text-green-800'
};

const AccountTable = ({ title, subtitle, Icon, load, extraColumns = [], action }) => {
  const { user: me } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    load()
      .then(setAccounts)
      .catch((error) => toast.error(errorMessage(error, 'Could not load accounts')))
      .finally(() => setLoading(false));
  }, [load]);

  const toggleEnabled = async (account) => {
    setBusyId(account.id);
    try {
      const updated = await medicalService.setUserEnabled(account.id, !account.enabled);
      setAccounts(prev => prev.map(a => (a.id === account.id ? updated : a)));
      toast.success(`${updated.firstName} ${updated.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the account'));
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'firstName', title: 'First Name' },
    { key: 'lastName', title: 'Last Name' },
    { key: 'email', title: 'Email' },
    { key: 'phoneNumber', title: 'Phone', render: (v) => v || '—' },
    ...extraColumns,
    {
      key: 'role',
      title: 'Role',
      render: (value) => (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${ROLE_BADGE[value] || 'bg-gray-100 text-gray-800'}`}>
          {value?.replace('ROLE_', '') === 'USER' ? 'PATIENT' : value?.replace('ROLE_', '')}
        </span>
      )
    },
    {
      key: 'enabled',
      title: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {value ? 'Active' : 'Awaiting password'}
        </span>
      )
    },
    { key: 'lastseen', title: 'Last Seen', render: (v) => (v ? v.replace('T', ' ') : 'Never') },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => toggleEnabled(row)}
          disabled={busyId === row.id || row.id === me?.id}
          title={row.id === me?.id ? 'You cannot disable your own account' : ''}
          className={`px-3 py-1 text-xs rounded-lg disabled:opacity-40 ${
            row.enabled ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {row.enabled ? 'Disable' : 'Enable'}
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Icon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{subtitle} · {accounts.length} total</p>
            </div>
          </div>
          {action}
        </div>

        {accounts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No accounts yet.</div>
        ) : (
          <DataTable data={accounts} columns={columns} title="" searchable={true} />
        )}
      </motion.div>
    </div>
  );
};

export default AccountTable;
