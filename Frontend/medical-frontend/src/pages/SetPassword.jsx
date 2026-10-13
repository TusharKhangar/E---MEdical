// src/pages/SetPassword.jsx
// Reached from the sign-up confirmation e-mail or a staff invitation.
import React from 'react';
import ChoosePassword from '../components/auth/ChoosePassword';

const SetPassword = () => (
  <ChoosePassword
    endpoint="/confirmPassword"
    title="Choose your password"
    subtitle="Your e-mail is confirmed. Pick a password to finish setting up your account."
    done="Your password is set. Sign in to continue."
  />
);

export default SetPassword;
