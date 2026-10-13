// Admin home: clinic figures, requests waiting for a doctor, and the latest bookings.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarChart3, CalendarDays, CheckCircle2, Mail, Stethoscope, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { medicalService, errorMessage } from '../../services/medicalService';
import StatusBadge from '../common/StatusBadge';
import { Empty, PageTitle, Panel, Stat } from './ui';
import { greeting, longDate } from '../../utils/format';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [mail, setMail] = useState(null);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    try {
      // Only the handful of rows the cards show, not the whole appointments table
      const [s, p, r] = await Promise.all([
        medicalService.getStats(),
        medicalService.searchAppointments({ status: 'PENDING', sort: 'soonest', size: 6 }),
        medicalService.searchAppointments({ sort: 'booked', size: 6 }),
      ]);
      setStats(s);
      setPending(p.content);
      setRecent(r.content);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load the dashboard'));
    }
  };

  useEffect(() => {
    load();
    medicalService.getMailStatus().then(setMail).catch(() => {});
  }, []);

  const sendTestEmail = async () => {
    setTesting(true);
    try {
      toast.success(await medicalService.sendTestEmail(), { duration: 6000 });
    } catch (error) {
      toast.error(errorMessage(error, 'The test e-mail could not be sent'), { duration: 8000 });
    } finally {
      setTesting(false);
    }
  };

  const handleStatus = async (id, status) => {
    setBusyId(id);
    try {
      await medicalService.setAppointmentStatus(id, status);
      toast.success(status === 'CONFIRMED' ? 'Appointment confirmed' : 'Appointment cancelled');
      await load();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the appointment'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title={`${greeting()}, ${user?.firstName || 'there'}`} subtitle="Here’s how the clinic is doing today.">
        <Link to="/dashboard/analytics" className="btn-secondary"><BarChart3 className="h-4 w-4" aria-hidden="true" /> Analytics</Link>
        <Link to="/dashboard/add-doctor" className="btn-primary"><UserPlus className="h-4 w-4" aria-hidden="true" /> Add doctor</Link>
      </PageTitle>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Patients" value={stats?.patients?.toLocaleString()} note="Registered accounts" Icon={Users} />
        <Stat label="Doctors" value={stats?.doctors?.toLocaleString()} note="On staff" Icon={Stethoscope} />
        <Stat label="Appointments" value={stats?.appointments?.toLocaleString()} note={`${stats?.pending ?? 0} awaiting a doctor`} Icon={CalendarDays} />
        <Stat label="Completed" value={stats?.completed?.toLocaleString()} note={`${stats?.cancelled ?? 0} cancelled`} Icon={CheckCircle2} />
      </div>

      {mail && (
        <section className={`card flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${mail.configured ? '' : 'border-amber-300 bg-amber-50'}`}
          aria-labelledby="mail-status">
          <div className="flex items-start gap-3">
            <Mail className={`mt-0.5 h-5 w-5 shrink-0 ${mail.configured ? 'text-brand-700' : 'text-amber-700'}`} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <h2 id="mail-status" className="text-sm font-semibold text-slate-900">
                {mail.configured ? 'E-mail is set up' : 'E-mail is not set up'}
              </h2>
              <p className="text-sm text-slate-600">
                {mail.configured
                  ? `${mail.description}. Sign-up links, reminders and password resets go out from here.`
                  : 'Sign-up links, reminders and password resets are only written to the server log. Set BREVO_API_KEY and MAIL_FROM in the hosting settings.'}
              </p>
            </div>
          </div>
          <button onClick={sendTestEmail} disabled={testing} className="btn-secondary">
            {testing ? 'Sending…' : 'Send me a test e-mail'}
          </button>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Waiting for confirmation"
          action={<span className="text-xs font-medium text-slate-600">{stats?.pending ?? 0} pending</span>}
        >
          {pending.length === 0 ? (
            <Empty>Nothing waiting. Every request has an answer.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{a.name}</p>
                    <p className="truncate text-xs text-slate-600">
                      {a.doctorName} · {a.department || 'General'} · {longDate(a.date)}, {a.time}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleStatus(a.id, 'CONFIRMED')} disabled={busyId === a.id} className="btn-primary btn-sm">Confirm</button>
                    <button onClick={() => handleStatus(a.id, 'CANCELLED')} disabled={busyId === a.id} className="btn-secondary btn-sm">Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Latest bookings" action={<Link to="/dashboard/appointments" className="link text-sm">View all</Link>}>
          {recent.length === 0 ? (
            <Empty>No appointments yet.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-900">{a.name} <span className="text-slate-600">with</span> {a.doctorName}</p>
                    <p className="text-xs text-slate-600">{longDate(a.date)}, {a.time}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default AdminDashboard;
