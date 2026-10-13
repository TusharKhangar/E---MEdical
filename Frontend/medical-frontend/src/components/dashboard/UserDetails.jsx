// src/components/dashboard/UserDetails.jsx
import React from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';
import AccountTable from './AccountTable';

const UserDetails = () => (
  <AccountTable
    title="Patients"
    subtitle="Everyone who registered through the website"
    Icon={UsersIcon}
    role="USER"
    extraColumns={[{ key: 'gender', title: 'Gender', render: (v) => v || '—' }]}
  />
);

export default UserDetails;
