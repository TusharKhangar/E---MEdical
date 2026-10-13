// src/components/dashboard/AccountTable.jsx
// Shared admin screen for listing patients, doctors or administrators, with an enable/disable switch.
// Search and paging run on the server, so it stays quick with thousands of accounts.
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { medicalService, errorMessage } from '../../services/medicalService';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import ServerTable from '../common/ServerTable';
import DoctorAvatar from '../common/DoctorAvatar';
import { PageTitle } from './ui';

const PAGE_SIZE = 20;

const AccountTable = ({ title, subtitle, role, extraColumns = [], action, searchHint = 'Search by name or e-mail' }) => {
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
    { key: 'firstName', title: 'Name', render: (_, row) => (
      <span className="flex items-center gap-3">
        <DoctorAvatar doctor={row} size="h-8 w-8 text-xs" />
        <span>
          <span className="block font-medium text-slate-900">{row.firstName} {row.lastName}</span>
          <span className="text-xs text-slate-600">{row.email}</span>
        </span>
      </span>
    ) },
    { key: 'phoneNumber', title: 'Phone', render: (v) => v || '–' },
    ...extraColumns,
    {
      key: 'enabled',
      title: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${value ? 'text-emerald-800' : 'text-amber-800'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${value ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
          {value ? 'Active' : 'Invited or switched off'}
        </span>
      )
    },
    { key: 'lastseen', title: 'Last seen', render: (v) => (v ? v.replace('T', ' ').slice(0, 16) : 'Never') },
    {
      key: 'actions',
      title: <span className="sr-only">Actions</span>,
      render: (_, row) => (
        <div className="text-right">
          <button
            onClick={() => toggleEnabled(row)}
            disabled={busyId === row.id || row.id === me?.id}
            title={row.id === me?.id ? 'You cannot switch off your own account' : ''}
            className={row.enabled ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
          >
            {row.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageTitle title={title} subtitle={`${subtitle}${page ? ` · ${page.totalElements.toLocaleString()} ${q ? 'found' : 'total'}` : ''}`}>
        {action}
      </PageTitle>
      <section className="card">
        <div className="p-4">
          <label className="relative block max-w-sm">
            <span className="sr-only">{searchHint}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchHint} className="input pl-9" />
          </label>
        </div>
        <ServerTable
          page={page}
          columns={columns}
          onPage={setPageNo}
          loading={loading}
          empty={q ? `No one matches "${q}".` : 'No accounts yet.'}
        />
      </section>
    </div>
  );
};

export default AccountTable;
