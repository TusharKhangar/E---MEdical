// src/components/dashboard/AdminDetails.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AccountTable from './AccountTable';

const AdminDetails = () => (
  <AccountTable
    title="Administrators"
    subtitle="Administrators manage staff, patients and every appointment"
    role="ADMIN"
    action={<Link to="/dashboard/add-admin" className="btn-primary"><UserPlus className="h-4 w-4" aria-hidden="true" /> Add administrator</Link>}
  />
);

export default AdminDetails;
