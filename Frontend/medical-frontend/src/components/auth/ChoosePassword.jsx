// Choosing a password from an e-mailed link: new accounts (/set-password) and resets (/reset-password).
// The server decides what's strong enough (zxcvbn score 3+) and says why when it isn't.
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { errorMessage } from '../../services/medicalService';
import AuthLayout from '../common/AuthLayout';
import PasswordInput from '../common/PasswordInput';

const ChoosePassword = ({ endpoint, title, subtitle, done }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('This link is incomplete. Please use the link from your e-mail.');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('The two passwords don’t match.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post(endpoint, { token, password: form.password });
      navigate('/login', { state: { message: done } });
    } catch (err) {
      setError(errorMessage(err, 'Could not save the password. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout standalone title={title} subtitle={subtitle}
      footer={<>Link not working? <Link to="/forgot-password" className="link">Send a new one</Link></>}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="label">New password</label>
          <PasswordInput id="password" name="password" value={form.password} onChange={handleChange}
            autoComplete="new-password" required aria-describedby="password-hint" />
          <p id="password-hint" className="mt-1.5 text-xs text-slate-600">
            Use something long and hard to guess. A few unrelated words work well.
          </p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="label">Repeat the password</label>
          <PasswordInput id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
            autoComplete="new-password" required />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
          {saving ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ChoosePassword;
