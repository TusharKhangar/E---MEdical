// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { errorMessage } from '../services/medicalService';
import AuthLayout from '../components/common/AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // The server answers the same way whether or not the address has an account
      await api.post('/forgotPassword', email, { headers: { 'Content-Type': 'text/plain' } });
      setSentTo(email);
    } catch (err) {
      setError(errorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the e-mail you signed up with and we’ll send you a link to choose a new password."
      footer={<>Remembered it? <Link to="/login" className="link">Sign in</Link></>}
    >
      {sentTo ? (
        <div role="status" className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          If {sentTo} has an account, a reset link is on its way. It works once. Check your spam folder if it
          doesn’t arrive in a few minutes.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="label">E-mail</label>
            <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" required className="input" />
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
            {isLoading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
