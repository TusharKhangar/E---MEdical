// Initials in a soft circle; we don't have photos, and stock faces would look fake.
import React from 'react';

const TONES = ['bg-brand-100 text-brand-800', 'bg-amber-100 text-amber-900', 'bg-sky-100 text-sky-900', 'bg-rose-100 text-rose-900', 'bg-violet-100 text-violet-900'];

const initials = (person) =>
  `${person?.firstName?.[0] || ''}${person?.lastName?.[0] || ''}`.toUpperCase() || '?';

const DoctorAvatar = ({ doctor, size = 'h-10 w-10 text-sm' }) => (
  <span
    aria-hidden="true"
    className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${size} ${TONES[(doctor?.id || 0) % TONES.length]}`}
  >
    {initials(doctor)}
  </span>
);

export default DoctorAvatar;
