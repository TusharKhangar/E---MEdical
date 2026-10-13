// About the clinic and what the app does for each kind of user.
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, FileText, HeartHandshake, Lock, MailCheck, Users } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

const PRINCIPLES = [
  { Icon: HeartHandshake, title: 'Care first', text: 'Every feature exists to get patients in front of the right doctor sooner.' },
  { Icon: MailCheck, title: 'No surprises', text: 'You hear from us when a visit is booked, confirmed, moved or cancelled, and the evening before.' },
  { Icon: Lock, title: 'Your data stays yours', text: 'Only you, your doctor and clinic administrators can see your appointments and prescriptions.' },
];

const ROLES = [
  { Icon: Users, title: 'Patients', points: ['Book and move appointments online', 'See the doctor’s real free times', 'Download prescriptions as PDF'] },
  { Icon: CalendarClock, title: 'Doctors', points: ['Set weekly hours and days off', 'Confirm or decline requests', 'Record notes and prescriptions'] },
  { Icon: FileText, title: 'Administrators', points: ['Invite doctors and staff by e-mail', 'Search every appointment', 'Follow bookings on the analytics page'] },
];

const About = () => (
  <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
    <PageHeader
      eyebrow="About"
      title="A calmer way to see a doctor"
      subtitle="E-Medical brings booking, reminders and prescriptions together, so patients spend less time on the phone and doctors spend more time with patients."
    />

    <section className="mt-12 grid gap-4 md:grid-cols-3" aria-labelledby="principles">
      <h2 id="principles" className="sr-only">What we stand for</h2>
      {PRINCIPLES.map(({ Icon, title, text }) => (
        <div key={title} className="card p-6">
          <Icon className="h-5 w-5 text-brand-700" strokeWidth={1.75} aria-hidden="true" />
          <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
          <p className="mt-1.5 text-sm text-slate-600">{text}</p>
        </div>
      ))}
    </section>

    <section className="mt-16">
      <h2 className="text-2xl font-semibold text-slate-900">Who it’s for</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {ROLES.map(({ Icon, title, points }) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-slate-600" strokeWidth={1.75} aria-hidden="true" />
              <h3 className="font-semibold text-slate-900">{title}</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {points.map((p) => (
                <li key={p} className="flex gap-2"><span aria-hidden="true" className="text-brand-600">•</span>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>

    <div className="mt-16 flex flex-wrap items-center gap-3">
      <Link to="/doctors" className="btn-primary">Find a doctor</Link>
      <Link to="/contact" className="btn-secondary">Contact us</Link>
    </div>
  </div>
);

export default About;
