// src/components/dashboard/AddDoctorForm.jsx
import React from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import StaffForm from './StaffForm';
import { medicalService } from '../../services/medicalService';

const AddDoctorForm = () => (
  <StaffForm
    kind="doctor"
    title="Add New Doctor"
    description="Register a doctor and their specialization. Patients can book them straight away once they set a password."
    Icon={AcademicCapIcon}
    iconColour="text-blue-600"
    submit={medicalService.addDoctor}
    listPath="/dashboard/doctor-details"
  />
);

export default AddDoctorForm;
