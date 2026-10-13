// Shared frame for sign-in, sign-up and password pages: the form on the left, a quiet panel on the right.
import React from 'react';
import { Bell, CalendarCheck, FileText } from 'lucide-react';
import Logo from './Logo';

const POINTS = [
  { Icon: CalendarCheck, text: 'Book with the doctor’s real free times' },
  { Icon: Bell, text: 'E-mail confirmation and a reminder the evening before' },
  { Icon: FileText, text: 'Prescriptions saved in your account as PDF' },
];

/** standalone: no site header around the page (e-mailed links), so show the logo here. */
const AuthLayout = ({ title, subtitle, children, footer, standalone = false }) => (
  <div className={`flex justify-center px-4 py-10 sm:py-16 ${standalone ? 'min-h-screen items-center bg-canvas' : ''}`}>
    <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card md:grid-cols-[1.1fr_1fr]">
      <div className="p-6 sm:p-10">
        {standalone && <div className="mb-8"><Logo /></div>}
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-600">{footer}</div>}
      </div>
      <aside className="hidden flex-col justify-between bg-brand-800 p-10 text-brand-50 md:flex">
        <p className="font-display text-2xl leading-snug text-white">
          Your appointments, reminders and prescriptions in one place.
        </p>
        <ul className="space-y-4">
          {POINTS.map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-200" aria-hidden="true" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  </div>
);

export default AuthLayout;
