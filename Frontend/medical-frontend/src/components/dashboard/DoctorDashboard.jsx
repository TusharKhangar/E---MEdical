// Doctor home: today's list in time order, requests to answer, and what's coming up.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarClock, CalendarDays, Inbox, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { medicalService, errorMessage } from '../../services/medicalService';
import PrescriptionDialog from '../appointments/PrescriptionDialog';
import StatusBadge from '../common/StatusBadge';
import { Empty, PageTitle, Panel, Stat } from './ui';
import { greeting, longDate, todayIso } from '../../utils/format';

const isActive = (a) => a.status === 'PENDING' || a.status === 'CONFIRMED';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [prescribing, setPrescribing] = useState(null);

  const load = () => medicalService.getDoctorAppointments()
    .then(setAppointments)
    .catch((error) => toast.error(errorMessage(error, 'Could not load your schedule')));

  useEffect(() => { load(); }, []);

  const today = todayIso();
  const todays = appointments.filter((a) => a.date === today && a.status !== 'CANCELLED').sort((a, b) => a.time.localeCompare(b.time));
  const requests = appointments.filter((a) => a.status === 'PENDING' && a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = appointments.filter((a) => a.date > today && a.status === 'CONFIRMED')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const patients = new Set(appointments.map((a) => a.email)).size;

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await medicalService.setDoctorAppointmentStatus(id, status);
      toast.success(status === 'CONFIRMED' ? 'Appointment confirmed' : 'Appointment cancelled');
      await load();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the appointment'));
    } finally {
      setBusyId(null);
    }
  };

  const Actions = ({ a }) => (
    <div className="flex shrink-0 gap-2">
      {a.status === 'PENDING' && (
        <button onClick={() => setStatus(a.id, 'CONFIRMED')} disabled={busyId === a.id} className="btn-primary btn-sm">Confirm</button>
      )}
      {a.status === 'CONFIRMED' && (
        <button onClick={() => setPrescribing(a)} disabled={busyId === a.id} className="btn-primary btn-sm">Complete visit</button>
      )}
      {isActive(a) && (
        <button onClick={() => setStatus(a.id, 'CANCELLED')} disabled={busyId === a.id} className="btn-secondary btn-sm">
          {a.status === 'PENDING' ? 'Decline' : 'Cancel'}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {prescribing && (
        <PrescriptionDialog appointment={prescribing} onClose={() => setPrescribing(null)}
          onSaved={() => { setPrescribing(null); load(); }} />
      )}

      <PageTitle title={`${greeting()}, Dr. ${user?.lastName || user?.firstName || ''}`.trim()} subtitle={user?.specialization || 'Your schedule'}>
        <Link to="/dashboard/availability" className="btn-secondary"><CalendarClock className="h-4 w-4" aria-hidden="true" /> Working hours</Link>
      </PageTitle>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Today" value={todays.length} note={todays.length === 1 ? 'appointment' : 'appointments'} Icon={CalendarDays} />
        <Stat label="To answer" value={requests.length} note="New requests" Icon={Inbox} />
        <Stat label="Coming up" value={upcoming.length} note="Confirmed, after today" Icon={CalendarClock} />
        <Stat label="Patients" value={patients} note="Have booked you" Icon={Users} />
      </div>

      <Panel title={`Today · ${longDate(today)}`} action={<Link to="/dashboard/appointments" className="link text-sm">Full schedule</Link>}>
        {todays.length === 0 ? (
          <Empty>No appointments today.</Empty>
        ) : (
          <ol className="divide-y divide-slate-100">
            {todays.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="w-14 text-sm font-semibold tabular-nums text-slate-900">{a.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{a.name}</p>
                  <p className="truncate text-xs text-slate-600">{a.description || 'No reason given'}</p>
                </div>
                <StatusBadge status={a.status} />
                <Actions a={a} />
              </li>
            ))}
          </ol>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Requests to answer">
          {requests.length === 0 ? (
            <Empty>You’re all caught up.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {requests.slice(0, 6).map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-600">{longDate(a.date)}, {a.time}</p>
                  </div>
                  <Actions a={a} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Confirmed, after today">
          {upcoming.length === 0 ? (
            <Empty>Nothing confirmed after today yet.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{a.name}</p>
                    <p className="truncate text-xs text-slate-600">{a.description || 'No reason given'}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-600">{longDate(a.date)}, {a.time}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default DoctorDashboard;
