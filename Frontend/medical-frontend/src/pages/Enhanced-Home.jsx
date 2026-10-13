// The public home page. Everything shown comes from the live database: departments and doctors from
// GET /api/doctors, the numbers from GET /api/stats.
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CalendarCheck, ClipboardList, FileText, Search, ShieldCheck } from 'lucide-react';
import { medicalService } from '../services/medicalService';
import { departmentsFromDoctors } from '../utils/departments';
import DoctorAvatar from '../components/common/DoctorAvatar';

const STEPS = [
  { Icon: Search, title: 'Pick a doctor and a time', text: 'See real free slots for each doctor, based on their working hours and days off.' },
  { Icon: Bell, title: 'Get confirmed and reminded', text: 'You get an e-mail when the doctor confirms, and a reminder the evening before.' },
  { Icon: FileText, title: 'Keep your prescription', text: 'After the visit, your diagnosis and medicines are in your account as a PDF.' },
];

const FOR_CLINIC = [
  { Icon: CalendarCheck, title: 'Doctors run their own schedule', text: 'Weekly hours, days off and a clear list of who is coming today.' },
  { Icon: ClipboardList, title: 'Notes and prescriptions in one step', text: 'Completing a visit records the diagnosis, medicines and follow-up date.' },
  { Icon: ShieldCheck, title: 'Admins see the whole clinic', text: 'Search every appointment, invite staff and follow bookings on the analytics page.' },
];

const Home = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [department, setDepartment] = useState('');

  useEffect(() => {
    medicalService.getDoctors().then(setDoctors).catch(() => setDoctors([]));
    medicalService.getPublicStats().then(setStats).catch(() => setStats(null));
  }, []);

  const departments = departmentsFromDoctors(doctors);

  const search = (e) => {
    e.preventDefault();
    navigate(department ? `/doctors?department=${encodeURIComponent(department)}` : '/doctors');
  };

  const numbers = stats && [
    { value: stats.doctors, label: 'doctors' },
    { value: stats.departments, label: 'departments' },
    { value: stats.patients, label: 'registered patients' },
    { value: stats.completedVisits, label: 'completed visits' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-canvas">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="eyebrow">Online appointments</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-slate-900 sm:text-5xl">
              See the right doctor, without the waiting room queue.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Choose a department, pick a free slot and get a confirmation by e-mail. Your prescriptions stay in
              your account after every visit.
            </p>

            <form onSubmit={search} className="mt-8 flex max-w-xl flex-col gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-card sm:flex-row">
              <label htmlFor="home-department" className="sr-only">Department</label>
              <select
                id="home-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="flex-1 rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="">All departments</option>
                {departments.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
              <button type="submit" className="btn-primary px-5 py-2.5">
                <Search className="h-4 w-4" aria-hidden="true" /> Find a doctor
              </button>
            </form>

            {numbers && (
              <dl className="mt-10 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
                {numbers.map((n) => (
                  <div key={n.label}>
                    <dt className="sr-only">{n.label}</dt>
                    <dd className="text-2xl font-semibold text-slate-900">{n.value.toLocaleString()}</dd>
                    <dd className="text-sm text-slate-600">{n.label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* A real preview: the first few doctors you can book */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Doctors taking appointments</h2>
              <Link to="/doctors" className="link text-sm">See all</Link>
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {doctors.slice(0, 5).map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <DoctorAvatar doctor={d} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">Dr. {d.firstName} {d.lastName}</p>
                    <p className="truncate text-xs text-slate-600">{d.specialization || 'General practice'}</p>
                  </div>
                  <Link to={`/dashboard/make-appointment?doctorId=${d.id}`} className="btn-secondary btn-sm">Book</Link>
                </li>
              ))}
              {doctors.length === 0 && (
                <li className="py-8 text-center text-sm text-slate-600">Doctors will appear here once the clinic adds them.</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Departments */}
      {departments.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Departments</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Specialists under one roof</h2>
            </div>
            <Link to="/departments" className="link inline-flex items-center gap-1 text-sm">
              All departments <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.slice(0, 8).map(({ name, Icon, summary, doctorCount }) => (
              <li key={name}>
                <Link
                  to={`/doctors?department=${encodeURIComponent(name)}`}
                  className="card group flex h-full flex-col p-5 transition-colors hover:border-brand-300"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="mt-4 font-semibold text-slate-900">{name}</span>
                  <span className="mt-1 text-sm text-slate-600">{summary}</span>
                  <span className="mt-auto pt-4 text-xs font-medium text-slate-600">
                    {doctorCount} {doctorCount === 1 ? 'doctor' : 'doctors'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">From booking to prescription</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ Icon, title, text }, i) => (
              <li key={title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-700">
                    {i + 1}
                  </span>
                  <Icon className="h-5 w-5 text-brand-700" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* For the clinic */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">For doctors and staff</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">The same app runs the clinic</h2>
            <p className="mt-3 text-slate-600">
              Doctors and administrators sign in to their own workspace. Staff accounts are invited by e-mail
              and choose their own password.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {FOR_CLINIC.map(({ Icon, title, text }) => (
              <li key={title} className="card p-5">
                <Icon className="h-5 w-5 text-brand-700" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand-800 px-6 py-10 text-white sm:px-10 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Ready when you are.</h2>
            <p className="mt-2 text-brand-100">Create a free account with your e-mail and book your first visit.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/register" className="btn bg-white text-brand-800 hover:bg-brand-50">Create an account</Link>
            <Link to="/login" className="btn border border-brand-500 text-white hover:bg-brand-700">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
