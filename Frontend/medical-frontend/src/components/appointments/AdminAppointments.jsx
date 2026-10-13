// src/components/appointments/AdminAppointments.jsx
// Every appointment in the clinic, for admins. Search, status, date range and paging all run on the
// server (GET /api/admin/appointments/search), so the page loads one screenful, not the whole table.
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { medicalService, errorMessage } from '../../services/medicalService';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import ServerTable from '../common/ServerTable';
import StatusBadge from '../common/StatusBadge';
import PrescriptionView from './PrescriptionView';

const PAGE_SIZE = 20;
const STATUSES = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const AdminAppointments = () => {
  const [page, setPage] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ q: '', status: '', from: '', to: '' });
  const [pageNo, setPageNo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const closeViewing = useCallback(() => setViewing(null), []);
  const q = useDebouncedValue(filters.q);

  const load = useCallback(() => {
    setLoading(true);
    return medicalService
      .searchAppointments({ q, status: filters.status, from: filters.from, to: filters.to, page: pageNo, size: PAGE_SIZE })
      .then(setPage)
      .catch((error) => toast.error(errorMessage(error, 'Could not load appointments')))
      .finally(() => setLoading(false));
  }, [q, filters.status, filters.from, filters.to, pageNo]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    medicalService.getStats().then(setStats).catch(() => {});
  }, []);

  // Any new filter starts again from the first page
  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPageNo(0);
  };

  const changeStatus = async (row, status) => {
    if (status === 'CANCELLED' && !window.confirm('Cancel this appointment?')) return;
    setBusyId(row.id);
    try {
      const updated = await medicalService.setAppointmentStatus(row.id, status);
      setPage((prev) => ({ ...prev, content: prev.content.map((a) => (a.id === row.id ? updated : a)) }));
      medicalService.getStats().then(setStats).catch(() => {});
      toast.success(`Appointment ${updated.status.toLowerCase()}`);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the appointment'));
    } finally {
      setBusyId(null);
    }
  };

  const action = (row, status, Icon, title, colour) => (
    <button onClick={() => changeStatus(row, status)} disabled={busyId === row.id}
      className={`${colour} p-1 rounded disabled:opacity-40`} title={title} aria-label={title}>
      <Icon className="h-5 w-5" />
    </button>
  );

  const columns = [
    { key: 'date', title: 'Date' },
    { key: 'time', title: 'Time' },
    { key: 'name', title: 'Patient' },
    { key: 'email', title: 'Email' },
    { key: 'doctorName', title: 'Doctor' },
    { key: 'department', title: 'Department', render: (v) => v || 'General' },
    { key: 'status', title: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          {row.status === 'PENDING' && action(row, 'CONFIRMED', CheckCircleIcon, 'Confirm', 'text-green-600 hover:bg-green-50')}
          {row.status === 'CONFIRMED' && action(row, 'COMPLETED', CheckBadgeIcon, 'Mark completed', 'text-blue-600 hover:bg-blue-50')}
          {(row.status === 'PENDING' || row.status === 'CONFIRMED') &&
            action(row, 'CANCELLED', XCircleIcon, 'Cancel', 'text-red-600 hover:bg-red-50')}
          {row.hasPrescription && (
            <button onClick={() => setViewing(row.id)} className="text-purple-600 hover:bg-purple-50 p-1 rounded"
              title="View prescription" aria-label="View prescription">
              <DocumentTextIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )
    }
  ];

  const count = (status) => {
    if (!stats) return null;
    return status ? stats[status.toLowerCase()] : stats.appointments;
  };

  const input = 'border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="space-y-6">
      {viewing && <PrescriptionView appointmentId={viewing} onClose={closeViewing} />}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 space-y-5">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600">
                Every appointment in the clinic
                {page && ` · ${page.totalElements.toLocaleString()} matching`}
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto" role="tablist">
            {STATUSES.map((s) => (
              <button key={s || 'all'} role="tab" aria-selected={filters.status === s}
                onClick={() => setFilter('status', s)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filters.status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {s ? s.charAt(0) + s.slice(1).toLowerCase() : 'All'}
                {count(s) != null && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filters.status === s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count(s).toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="relative flex-1 min-w-[14rem]">
              <span className="sr-only">Search appointments</span>
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="search" value={filters.q} onChange={(e) => setFilter('q', e.target.value)}
                placeholder="Patient, e-mail, doctor or department" className={`${input} w-full pl-10`} />
            </label>
            <label className="text-sm text-gray-600">
              <span className="block mb-1">From</span>
              <input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} className={input} />
            </label>
            <label className="text-sm text-gray-600">
              <span className="block mb-1">To</span>
              <input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} className={input} />
            </label>
            {(filters.q || filters.status || filters.from || filters.to) && (
              <button onClick={() => { setFilters({ q: '', status: '', from: '', to: '' }); setPageNo(0); }}
                className="text-sm text-blue-600 hover:text-blue-800 py-2">
                Clear filters
              </button>
            )}
          </div>
        </div>

        <ServerTable page={page} columns={columns} onPage={setPageNo} loading={loading}
          empty="No appointments match these filters." />
      </motion.div>
    </div>
  );
};

export default AdminAppointments;
