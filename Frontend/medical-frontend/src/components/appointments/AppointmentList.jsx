// src/components/appointments/AppointmentList.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarPlus, Check, CheckCheck, FileText, Pencil, RotateCcw, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RescheduleDialog from './RescheduleDialog';
import PrescriptionDialog from './PrescriptionDialog';
import PrescriptionView from './PrescriptionView';
import AdminAppointments from './AdminAppointments';
import ServerTable from '../common/ServerTable';
import StatusBadge from '../common/StatusBadge';
import { PageTitle, Spinner } from '../dashboard/ui';
import { getAppointmentsForRole, setAppointmentStatusForRole, errorMessage } from '../../services/medicalService';
import { longDate, todayIso } from '../../utils/format';
import { pageOf } from '../../utils/paging';

const PAGE_SIZE = 15;
const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'all', label: 'All' },
];

const isActive = (a) => a.status === 'PENDING' || a.status === 'CONFIRMED';

/** Small square icon button with a tooltip and an accessible name. */
const IconButton = ({ title, onClick, disabled, Icon, tone = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' }) => (
  <button type="button" title={title} aria-label={title} onClick={onClick} disabled={disabled}
    className={`rounded-md p-1.5 transition-colors disabled:opacity-40 ${tone}`}>
    <Icon className="h-4 w-4" />
  </button>
);

/** A patient's or doctor's own appointments (short lists, filtered in the browser). */
const OwnAppointments = () => {
  const { user, isPatient, isDoctor } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [query, setQuery] = useState('');
  const [pageNo, setPageNo] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [rescheduling, setRescheduling] = useState(null);
  const [prescribing, setPrescribing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const closeViewing = useCallback(() => setViewing(null), []);

  const fetchAppointments = useCallback(async () => {
    try {
      setAppointments(await getAppointmentsForRole(user?.role));
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load appointments'));
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { setPageNo(0); }, [tab, query]);

  const today = todayIso();
  const counts = useMemo(() => {
    const c = { upcoming: 0, all: appointments.length };
    appointments.forEach((a) => {
      c[a.status] = (c[a.status] || 0) + 1;
      if (a.date >= today && isActive(a)) c.upcoming += 1;
    });
    return c;
  }, [appointments, today]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = appointments.filter((a) =>
      tab === 'all' ? true : tab === 'upcoming' ? a.date >= today && isActive(a) : a.status === tab);
    if (q) {
      rows = rows.filter((a) => [a.name, a.email, a.doctorName, a.department, a.description]
        .some((v) => v?.toLowerCase().includes(q)));
    }
    // Upcoming reads best soonest first; history newest first
    return tab === 'upcoming'
      ? [...rows].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      : rows;
  }, [appointments, tab, query, today]);

  const replace = (updated) => setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  const handleStatusChange = async (row, newStatus) => {
    if (newStatus === 'CANCELLED' && !window.confirm('Cancel this appointment?')) return;
    setBusyId(row.id);
    try {
      const updated = await setAppointmentStatusForRole(user?.role, row.id, newStatus);
      replace(updated);
      toast.success(`Appointment ${updated.status.toLowerCase()}`);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the appointment'));
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: 'date', title: 'When',
      render: (_, row) => (
        <span>
          <span className="block font-medium text-slate-900">{longDate(row.date)}</span>
          <span className="text-xs text-slate-600">{row.time}</span>
        </span>
      ),
    },
    ...(isPatient()
      ? [{ key: 'doctorName', title: 'Doctor', render: (v, row) => (
          <span><span className="block text-slate-900">{v}</span><span className="text-xs text-slate-600">{row.department || 'General'}</span></span>) }]
      : [{ key: 'name', title: 'Patient', render: (v, row) => (
          <span><span className="block text-slate-900">{v}</span><span className="text-xs text-slate-600">{row.email}</span></span>) }]),
    { key: 'description', title: 'Reason', className: 'max-w-xs truncate whitespace-normal', render: (v) => v || <span className="text-slate-600">–</span> },
    { key: 'status', title: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'actions', title: <span className="sr-only">Actions</span>,
      render: (_, row) => (
        <div className="flex items-center justify-end gap-0.5">
          {isPatient() && isActive(row) && (
            <>
              <IconButton title="Reschedule" Icon={RotateCcw} onClick={() => setRescheduling(row)} />
              <IconButton title="Cancel" Icon={X} disabled={busyId === row.id} onClick={() => handleStatusChange(row, 'CANCELLED')}
                tone="text-slate-600 hover:bg-red-50 hover:text-red-700" />
            </>
          )}
          {isDoctor() && row.status === 'PENDING' && (
            <IconButton title="Confirm" Icon={Check} disabled={busyId === row.id} onClick={() => handleStatusChange(row, 'CONFIRMED')}
              tone="text-brand-700 hover:bg-brand-50" />
          )}
          {isDoctor() && row.status === 'CONFIRMED' && (
            <IconButton title="Complete visit and write prescription" Icon={CheckCheck} onClick={() => setPrescribing(row)}
              tone="text-brand-700 hover:bg-brand-50" />
          )}
          {isDoctor() && isActive(row) && (
            <IconButton title="Cancel" Icon={X} disabled={busyId === row.id} onClick={() => handleStatusChange(row, 'CANCELLED')}
              tone="text-slate-600 hover:bg-red-50 hover:text-red-700" />
          )}
          {row.hasPrescription && <IconButton title="View prescription" Icon={FileText} onClick={() => setViewing(row.id)} />}
          {isDoctor() && row.hasPrescription && <IconButton title="Edit prescription" Icon={Pencil} onClick={() => setPrescribing(row)} />}
        </div>
      ),
    },
  ];

  if (loading) return <Spinner />;

  return (
    <div>
      {rescheduling && (
        <RescheduleDialog appointment={rescheduling} onClose={() => setRescheduling(null)}
          onDone={(updated) => { replace(updated); setRescheduling(null); }} />
      )}
      {prescribing && (
        <PrescriptionDialog appointment={prescribing} onClose={() => setPrescribing(null)}
          onSaved={() => { setPrescribing(null); fetchAppointments(); }} />
      )}
      {viewing && <PrescriptionView appointmentId={viewing} onClose={closeViewing} />}

      <PageTitle
        title={isPatient() ? 'My appointments' : 'My schedule'}
        subtitle={isPatient() ? 'Reschedule, cancel or open a prescription.' : 'Confirm requests, complete visits and write prescriptions.'}
      >
        {isPatient() && (
          <Link to="/dashboard/make-appointment" className="btn-primary"><CalendarPlus className="h-4 w-4" aria-hidden="true" /> Book appointment</Link>
        )}
      </PageTitle>

      <section className="card">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter by status">
            {TABS.map((t) => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                {t.label}
                <span className={`rounded-full px-1.5 text-xs tabular-nums ${tab === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                  {counts[t.key] || 0}
                </span>
              </button>
            ))}
          </div>
          <label className="relative lg:w-72">
            <span className="sr-only">Search appointments</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={isPatient() ? 'Search doctor or reason' : 'Search patient or reason'} className="input pl-9" />
          </label>
        </div>
        <ServerTable
          page={pageOf(visible, pageNo, PAGE_SIZE)}
          columns={columns}
          onPage={setPageNo}
          empty={query ? 'Nothing matches that search.' : tab === 'upcoming' ? 'Nothing coming up.' : 'No appointments here.'}
        />
      </section>
    </div>
  );
};

/** Admins get the server-side searchable table; patients and doctors see their own list. */
const AppointmentList = () => {
  const { user } = useAuth();
  return user?.role === 'ROLE_ADMIN' ? <AdminAppointments /> : <OwnAppointments />;
};

export default AppointmentList;
