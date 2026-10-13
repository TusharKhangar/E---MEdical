// Patient home: the next visit front and centre, then upcoming and recent visits.
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarClock, CalendarPlus, CheckCircle2, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { medicalService, errorMessage } from '../../services/medicalService';
import PrescriptionView from '../appointments/PrescriptionView';
import RescheduleDialog from '../appointments/RescheduleDialog';
import StatusBadge from '../common/StatusBadge';
import { Empty, PageTitle, Panel, Stat } from './ui';
import { greeting, longDate, todayIso } from '../../utils/format';

const isActive = (a) => a.status === 'PENDING' || a.status === 'CONFIRMED';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [moving, setMoving] = useState(null);
  const closeViewing = useCallback(() => setViewing(null), []);

  useEffect(() => {
    medicalService.getMyAppointments()
      .then(setAppointments)
      .catch((error) => toast.error(errorMessage(error, 'Could not load your appointments')))
      .finally(() => setLoading(false));
  }, []);

  const today = todayIso();
  const upcoming = appointments
    .filter((a) => a.date >= today && isActive(a))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = appointments.filter((a) => !upcoming.includes(a)).slice(0, 5);
  const next = upcoming[0];

  const replace = (updated) => setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  const cancel = async (a) => {
    if (!window.confirm(`Cancel your appointment with ${a.doctorName} on ${longDate(a.date)}?`)) return;
    try {
      replace(await medicalService.cancelMyAppointment(a.id));
      toast.success('Appointment cancelled');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not cancel the appointment'));
    }
  };

  return (
    <div className="space-y-6">
      {viewing && <PrescriptionView appointmentId={viewing} onClose={closeViewing} />}
      {moving && <RescheduleDialog appointment={moving} onClose={() => setMoving(null)} onDone={(u) => { replace(u); setMoving(null); }} />}

      <PageTitle title={`${greeting()}, ${user?.firstName || 'there'}`} subtitle="Your appointments and prescriptions.">
        <Link to="/dashboard/make-appointment" className="btn-primary"><CalendarPlus className="h-4 w-4" aria-hidden="true" /> Book appointment</Link>
      </PageTitle>

      {/* Next visit */}
      <section className="card overflow-hidden" aria-labelledby="next-visit">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <CalendarClock className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h2 id="next-visit" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Next visit</h2>
              {loading ? (
                <p className="mt-1 text-sm text-slate-600">Loading…</p>
              ) : next ? (
                <>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{longDate(next.date)} at {next.time}</p>
                  <p className="text-sm text-slate-600">{next.doctorName} · {next.department || 'General'}</p>
                  <div className="mt-2"><StatusBadge status={next.status} /></div>
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-600">Nothing booked. When you book, it shows up here.</p>
              )}
            </div>
          </div>
          {next && (
            <div className="flex gap-2">
              <button onClick={() => setMoving(next)} className="btn-secondary">Reschedule</button>
              <button onClick={() => cancel(next)} className="btn-danger">Cancel</button>
            </div>
          )}
        </div>
        {next?.status === 'PENDING' && (
          <p className="border-t border-slate-100 bg-amber-50 px-6 py-2.5 text-xs text-amber-900">
            Waiting for the doctor to confirm. We’ll e-mail you as soon as they do.
          </p>
        )}
      </section>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Upcoming" value={upcoming.length} Icon={Clock} />
        <Stat label="Completed" value={appointments.filter((a) => a.status === 'COMPLETED').length} Icon={CheckCircle2} />
        <Stat label="Prescriptions" value={appointments.filter((a) => a.hasPrescription).length} Icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Coming up" action={<Link to="/dashboard/appointments" className="link text-sm">All appointments</Link>}>
          {upcoming.length === 0 ? (
            <Empty>No upcoming appointments.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{a.doctorName}</p>
                    <p className="text-xs text-slate-600">{longDate(a.date)}, {a.time}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Past visits">
          {past.length === 0 ? (
            <Empty>No past visits yet.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {past.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{a.doctorName}</p>
                    <p className="text-xs text-slate-600">{longDate(a.date)} · {a.department || 'General'}</p>
                  </div>
                  {a.hasPrescription ? (
                    <button onClick={() => setViewing(a.id)} className="btn-secondary btn-sm">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Prescription
                    </button>
                  ) : (
                    <StatusBadge status={a.status} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default PatientDashboard;
