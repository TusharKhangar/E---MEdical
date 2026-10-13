// src/components/dashboard/AdminDetails.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import AccountTable from './AccountTable';

const AdminDetails = () => (
  <AccountTable
    title="Administrators"
    subtitle="Administrators manage staff, patients and every appointment"
    Icon={ShieldCheckIcon}
    role="ADMIN"
    action={
      <Link to="/dashboard/add-admin" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <PlusIcon className="h-4 w-4 mr-2" /> Add Admin
      </Link>
    }
  />
);

export default AdminDetails;
