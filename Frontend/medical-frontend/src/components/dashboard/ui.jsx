// Small building blocks shared by the dashboard pages.
import React from 'react';

/** Page title row: title and subtitle on the left, actions on the right. */
export const PageTitle = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
);

/** A number with a label, for the row of figures at the top of a dashboard. */
export const Stat = ({ label, value, note, Icon }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {Icon && <Icon className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden="true" />}
    </div>
    <p className="mt-2 text-2xl font-semibold text-slate-900">{value ?? '–'}</p>
    {note && <p className="mt-1 text-xs text-slate-600">{note}</p>}
  </div>
);

/** A titled card; `action` sits at the right of the header. */
export const Panel = ({ title, action, children, className = '' }) => (
  <section className={`card ${className}`}>
    {(title || action) && (
      <div className="card-header">
        {title && <h2 className="card-title">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);

export const Empty = ({ children }) => <p className="px-5 py-10 text-center text-sm text-slate-600">{children}</p>;

export const Spinner = () => (
  <div className="flex h-64 items-center justify-center" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
  </div>
);
