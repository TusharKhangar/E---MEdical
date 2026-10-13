// src/components/dashboard/AddDoctorForm.jsx
import React from 'react';
import StaffForm from './StaffForm';
import { medicalService } from '../../services/medicalService';

const AddDoctorForm = () => (
  <StaffForm
    kind="doctor"
    title="Add a doctor"
    description="Patients can book them as soon as they set their password from the invitation e-mail."
    submit={medicalService.addDoctor}
    listPath="/dashboard/doctor-details"
  />
);

export default AddDoctorForm;
