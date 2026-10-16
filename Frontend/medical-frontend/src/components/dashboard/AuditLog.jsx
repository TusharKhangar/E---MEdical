// src/components/dashboard/AuditLog.jsx
// Admin screen: everything administrators did, newest first. Read-only; the server never edits or deletes it.
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { medicalService, errorMessage } from '../../services/medicalService';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import ServerTable from '../common/ServerTable';
import { PageTitle } from './ui';

const PAGE_SIZE = 25;

const ACTION_LABELS = {
  ACCOUNT_DISABLED: 'Disabled account',
  ACCOUNT_ENABLED: 'Enabled account',
  ACCOUNT_DELETED: 'Deleted account',
  DOCTOR_INVITED: 'Invited doctor',
  ADMIN_INVITED: 'Invited administrator',
  APPOINTMENT_STATUS_CHANGED: 'Changed appointment',
};

const TONE = {
  ACCOUNT_DELETED: 'bg-red-50 text-red-800',
  ACCOUNT_DISABLED: 'bg-amber-50 text-amber-800',
};

const AuditLog = () => {
  const [page, setPage] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const q = useDebouncedValue(query);

  useEffect(() => { setPageNo(0); }, [q, action]);

  const load = useCallback(() => {
    setLoading(true);
    return medicalService.getAuditLog({ q, action, page: pageNo, size: PAGE_SIZE })
      .then(setPage)
      .catch((error) => toast.error(errorMessage(error, 'Could not load the audit log')))
      .finally(() => setLoading(false));
  }, [q, action, pageNo]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'at', title: 'When', render: (v) => v.replace('T', ' ').slice(0, 16) },
    { key: 'actor', title: 'Who' },
    {
      key: 'action',
      title: 'What',
      render: (v) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TONE[v] || 'bg-slate-100 text-slate-700'}`}>
          {ACTION_LABELS[v] || v}
        </span>
      ),
    },
    { key: 'target', title: 'To', className: 'max-w-md truncate' },
    { key: 'details', title: 'Details', render: (v) => v || '–' },
  ];

  return (
    <div>
      <PageTitle title="Audit log" subtitle={`What administrators changed, newest first${page ? ` · ${page.totalElements.toLocaleString()} ${q || action ? 'found' : 'total'}` : ''}`} />
      <section className="card">
        <div className="flex flex-wrap gap-3 p-4">
          <label className="relative block w-full max-w-sm">
            <span className="sr-only">Search by who did it or to whom</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by who did it or to whom" className="input pl-9" />
          </label>
          <select aria-label="Filter by action" value={action} onChange={(e) => setAction(e.target.value)} className="input w-auto">
            <option value="">All actions</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <ServerTable
          page={page}
          columns={columns}
          onPage={setPageNo}
          loading={loading}
          empty={q || action ? 'Nothing matches.' : 'No administrator actions yet.'}
        />
      </section>
    </div>
  );
};

export default AuditLog;
