// src/components/dashboard/AddAdminForm.jsx
import React from 'react';
import StaffForm from './StaffForm';
import { medicalService } from '../../services/medicalService';

const AddAdminForm = () => (
  <StaffForm
    kind="administrator"
    title="Add an administrator"
    description="Administrators manage doctors, patients and every appointment."
    submit={medicalService.addAdmin}
    listPath="/dashboard/admin-details"
  />
);

export default AddAdminForm;
