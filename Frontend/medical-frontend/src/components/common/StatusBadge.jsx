// src/components/common/StatusBadge.jsx
import React from 'react';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

/** Coloured pill for an appointment status. */
const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-800'}`}>
    {status}
  </span>
);

export default StatusBadge;
