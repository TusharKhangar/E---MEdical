// The E-Medical wordmark: a plain cross in a rounded square, then the name.
import React from 'react';
import { Link } from 'react-router-dom';

export const LogoMark = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="8" className="fill-brand-700" />
    <path d="M13 8h6v5h5v6h-5v5h-6v-5H8v-6h5z" fill="#fff" />
  </svg>
);

const Logo = ({ to = '/', inverted = false }) => (
  <Link to={to} className="flex items-center gap-2.5" aria-label="E-Medical home">
    <LogoMark />
    <span className={`text-lg font-semibold tracking-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>
      E-Medical
    </span>
  </Link>
);

export default Logo;
