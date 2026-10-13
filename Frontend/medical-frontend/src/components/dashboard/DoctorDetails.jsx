// src/components/dashboard/DoctorDetails.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AccountTable from './AccountTable';

const DoctorDetails = () => (
  <AccountTable
    title="Doctors"
    subtitle="Doctors confirm and complete the appointments booked with them"
    role="DOCTOR"
    searchHint="Search by name, e-mail or specialization"
    extraColumns={[{ key: 'specialization', title: 'Specialization', render: (v) => v || '–' }]}
    action={<Link to="/dashboard/add-doctor" className="btn-primary"><UserPlus className="h-4 w-4" aria-hidden="true" /> Add doctor</Link>}
  />
);

export default DoctorDetails;
