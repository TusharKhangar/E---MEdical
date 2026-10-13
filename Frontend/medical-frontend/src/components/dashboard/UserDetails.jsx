// src/components/dashboard/UserDetails.jsx
import React from 'react';
import AccountTable from './AccountTable';

const UserDetails = () => (
  <AccountTable
    title="Patients"
    subtitle="Everyone who registered through the website"
    role="USER"
    extraColumns={[{ key: 'gender', title: 'Gender', render: (v) => v || '–' }]}
  />
);

export default UserDetails;
