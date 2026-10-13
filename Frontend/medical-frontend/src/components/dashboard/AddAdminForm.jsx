// src/components/dashboard/AddAdminForm.jsx
import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import StaffForm from './StaffForm';
import { medicalService } from '../../services/medicalService';

const AddAdminForm = () => (
  <StaffForm
    kind="administrator"
    title="Add New Administrator"
    description="Administrators can manage doctors, patients and every appointment."
    Icon={ShieldCheckIcon}
    iconColour="text-red-600"
    submit={medicalService.addAdmin}
    listPath="/dashboard/admin-details"
  />
);

export default AddAdminForm;
