// Top bar for the public site.
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

const NAV = [
  { to: '/doctors', label: 'Find a doctor' },
  { to: '/departments', label: 'Departments' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const navClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-brand-700' : 'text-slate-600 hover:text-slate-900'}`;

const Header = () => {
  const { isAuthenticated, isPatient, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the phone menu whenever the page changes
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const bookPath = isAuthenticated && isPatient() ? '/dashboard/make-appointment' : isAuthenticated ? '/dashboard' : '/register';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-600">{user?.firstName}</span>
              <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
              <button onClick={handleLogout} className="btn-ghost">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to={bookPath} className="btn-primary">Book an appointment</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn-ghost -mr-2 px-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3" aria-label="Main">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-base font-medium ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700'}`}>
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
                  <button onClick={handleLogout} className="btn-ghost">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary">Sign in</Link>
                  <Link to={bookPath} className="btn-primary">Book</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
