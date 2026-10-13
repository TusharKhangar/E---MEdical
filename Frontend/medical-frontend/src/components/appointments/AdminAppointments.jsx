// src/components/appointments/AdminAppointments.jsx
// Every appointment in the clinic, for admins. Search, status, date range and paging all run on the
// server (GET /api/admin/appointments/search), so the page loads one screenful, not the whole table.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, CheckCheck, FileText, Search, X } from 'lucide-react';
import { medicalService, errorMessage } from '../../services/medicalService';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import ServerTable from '../common/ServerTable';
import StatusBadge from '../common/StatusBadge';
import PrescriptionView from './PrescriptionView';
import { PageTitle } from '../dashboard/ui';
import { longDate } from '../../utils/format';

const PAGE_SIZE = 20;
const STATUSES = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
const NO_FILTERS = { q: '', status: '', from: '', to: '' };

const AdminAppointments = () => {
  const [page, setPage] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(NO_FILTERS);
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
  useEffect(() => { medicalService.getStats().then(setStats).catch(() => {}); }, []);

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

  const action = (row, status, Icon, title, tone) => (
    <button type="button" onClick={() => changeStatus(row, status)} disabled={busyId === row.id} title={title} aria-label={title}
      className={`rounded-md p-1.5 transition-colors disabled:opacity-40 ${tone}`}>
      <Icon className="h-4 w-4" />
    </button>
  );

  const columns = [
    { key: 'date', title: 'When', render: (_, row) => (
      <span><span className="block font-medium text-slate-900">{longDate(row.date)}</span><span className="text-xs text-slate-600">{row.time}</span></span>) },
    { key: 'name', title: 'Patient', render: (v, row) => (
      <span><span className="block text-slate-900">{v}</span><span className="text-xs text-slate-600">{row.email}</span></span>) },
    { key: 'doctorName', title: 'Doctor', render: (v, row) => (
      <span><span className="block text-slate-900">{v}</span><span className="text-xs text-slate-600">{row.department || 'General'}</span></span>) },
    { key: 'status', title: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'actions', title: <span className="sr-only">Actions</span>,
      render: (_, row) => (
        <div className="flex items-center justify-end gap-0.5">
          {row.status === 'PENDING' && action(row, 'CONFIRMED', Check, 'Confirm', 'text-brand-700 hover:bg-brand-50')}
          {row.status === 'CONFIRMED' && action(row, 'COMPLETED', CheckCheck, 'Mark completed', 'text-brand-700 hover:bg-brand-50')}
          {(row.status === 'PENDING' || row.status === 'CONFIRMED') &&
            action(row, 'CANCELLED', X, 'Cancel', 'text-slate-600 hover:bg-red-50 hover:text-red-700')}
          {row.hasPrescription && (
            <button type="button" onClick={() => setViewing(row.id)} title="View prescription" aria-label="View prescription"
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              <FileText className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const count = (status) => (stats ? (status ? stats[status.toLowerCase()] : stats.appointments) : null);
  const filtered = filters.q || filters.status || filters.from || filters.to;

  return (
    <div>
      {viewing && <PrescriptionView appointmentId={viewing} onClose={closeViewing} />}
      <PageTitle
        title="Appointments"
        subtitle={`Every appointment in the clinic${page ? ` · ${page.totalElements.toLocaleString()} matching` : ''}`}
      />

      <section className="card">
        <div className="space-y-3 p-4">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter by status">
            {STATUSES.map((s) => (
              <button key={s || 'all'} role="tab" aria-selected={filters.status === s} onClick={() => setFilter('status', s)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filters.status === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                {s ? s.charAt(0) + s.slice(1).toLowerCase() : 'All'}
                {count(s) != null && (
                  <span className={`rounded-full px-1.5 text-xs tabular-nums ${filters.status === s ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                    {count(s).toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="relative min-w-[14rem] flex-1">
              <span className="sr-only">Search appointments</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input type="search" value={filters.q} onChange={(e) => setFilter('q', e.target.value)}
                placeholder="Patient, e-mail, doctor or department" className="input pl-9" />
            </label>
            <div>
              <label htmlFor="appt-from" className="mb-1 block text-xs font-medium text-slate-600">From</label>
              <input id="appt-from" type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="appt-to" className="mb-1 block text-xs font-medium text-slate-600">To</label>
              <input id="appt-to" type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} className="input" />
            </div>
            {filtered && (
              <button onClick={() => { setFilters(NO_FILTERS); setPageNo(0); }} className="btn-ghost">Clear filters</button>
            )}
          </div>
        </div>

        <ServerTable page={page} columns={columns} onPage={setPageNo} loading={loading} empty="No appointments match these filters." />
      </section>
    </div>
  );
};

export default AdminAppointments;
