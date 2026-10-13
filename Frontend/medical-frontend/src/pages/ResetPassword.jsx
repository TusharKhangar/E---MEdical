// src/pages/ResetPassword.jsx
// Reached from the "reset your password" e-mail.
import React from 'react';
import ChoosePassword from '../components/auth/ChoosePassword';

const ResetPassword = () => (
  <ChoosePassword
    endpoint="/resetPassword"
    title="Choose a new password"
    subtitle="Pick a new password for your account. The link works once."
    done="Your password has been changed. Sign in with the new one."
  />
);

export default ResetPassword;
