// src/components/dashboard/DoctorDetails.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, PlusIcon } from '@heroicons/react/24/outline';
import AccountTable from './AccountTable';

const DoctorDetails = () => (
  <AccountTable
    title="Doctors"
    subtitle="Doctors can confirm and complete the appointments booked with them"
    Icon={AcademicCapIcon}
    role="DOCTOR"
    searchHint="Search by name, e-mail or specialization"
    extraColumns={[{ key: 'specialization', title: 'Specialization', render: (v) => v || '—' }]}
    action={
      <Link to="/dashboard/add-doctor" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <PlusIcon className="h-4 w-4 mr-2" /> Add Doctor
      </Link>
    }
  />
);

export default DoctorDetails;
