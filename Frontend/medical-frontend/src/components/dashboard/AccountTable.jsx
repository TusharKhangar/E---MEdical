// src/components/dashboard/AccountTable.jsx
// Shared admin screen for listing patients, doctors or administrators, with an enable/disable switch.
// Search and paging run on the server, so it stays quick with thousands of accounts.
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { medicalService, errorMessage } from '../../services/medicalService';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import ServerTable from '../common/ServerTable';

const ROLE_BADGE = {
  ROLE_ADMIN: 'bg-red-100 text-red-800',
  ROLE_DOCTOR: 'bg-blue-100 text-blue-800',
  ROLE_USER: 'bg-green-100 text-green-800'
};

const PAGE_SIZE = 20;

const AccountTable = ({ title, subtitle, Icon, role, extraColumns = [], action, searchHint = 'Search by name or e-mail' }) => {
  const { user: me } = useAuth();
  const [page, setPage] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const q = useDebouncedValue(query);

  // A new search starts again from the first page
  useEffect(() => { setPageNo(0); }, [q]);

  const load = useCallback(() => {
    setLoading(true);
    return medicalService.searchAccounts({ role, q, page: pageNo, size: PAGE_SIZE })
      .then(setPage)
      .catch((error) => toast.error(errorMessage(error, 'Could not load accounts')))
      .finally(() => setLoading(false));
  }, [role, q, pageNo]);

  useEffect(() => { load(); }, [load]);

  const toggleEnabled = async (account) => {
    setBusyId(account.id);
    try {
      const updated = await medicalService.setUserEnabled(account.id, !account.enabled);
      setPage(prev => ({ ...prev, content: prev.content.map(a => (a.id === account.id ? updated : a)) }));
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center">
            <Icon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">
                {subtitle}
                {page && ` · ${page.totalElements.toLocaleString()} ${q ? 'found' : 'total'}`}
              </p>
            </div>
          </div>
          {action}
        </div>
        <div className="px-6 pb-4">
          <label className="relative block max-w-sm">
            <span className="sr-only">{searchHint}</span>
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchHint}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </label>
        </div>
        <ServerTable
          page={page}
          columns={columns}
          onPage={setPageNo}
          loading={loading}
          empty={q ? `No one matches "${q}".` : 'No accounts yet.'}
        />
      </motion.div>
    </div>
  );
};

export default AccountTable;
