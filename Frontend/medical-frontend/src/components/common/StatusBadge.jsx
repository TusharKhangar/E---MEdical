// src/components/common/StatusBadge.jsx
import React from 'react';

// Muted fills with dark text, so every badge passes WCAG AA contrast
const STATUS_STYLES = {
  PENDING: 'bg-amber-50 text-amber-800 ring-amber-200',
  CONFIRMED: 'bg-sky-50 text-sky-800 ring-sky-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const LABELS = { PENDING: 'Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

/** Pill for an appointment status. */
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status] || STATUS_STYLES.CANCELLED}`}>
    {LABELS[status] || status}
  </span>
);

export default StatusBadge;
