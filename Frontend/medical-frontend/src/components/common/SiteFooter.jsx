// Footer for the public site. Contact details match the Contact page.
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Patients',
    links: [
      { to: '/doctors', label: 'Find a doctor' },
      { to: '/departments', label: 'Departments' },
      { to: '/register', label: 'Create an account' },
      { to: '/login', label: 'Sign in' },
    ],
  },
  {
    title: 'Clinic',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/contact', label: 'Contact' },
    ],
  },
];

const SiteFooter = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
      <div className="space-y-3">
        <Logo />
        <p className="max-w-xs text-sm text-slate-600">
          Book a doctor in a few clicks, get reminders before your visit and keep your prescriptions in one place.
        </p>
        <p className="text-sm text-slate-600">
          In an emergency, call <a href="tel:112" className="font-medium text-slate-900 underline underline-offset-2">112</a>.
        </p>
      </div>
      {COLUMNS.map((col) => (
        <div key={col.title}>
          <h2 className="text-sm font-semibold text-slate-900">{col.title}</h2>
          <ul className="mt-3 space-y-2">
            {col.links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-slate-600 hover:text-slate-900">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-slate-100">
      <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-600 sm:px-6">
        © {new Date().getFullYear()} E-Medical. Built with Spring Boot and React.
      </p>
    </div>
  </footer>
);

export default SiteFooter;
