// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../common/AuthLayout';
import PasswordInput from '../common/PasswordInput';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.message;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await login(formData.email, formData.password);
    setIsLoading(false);
    if (result.success) {
      // Back to the page that asked for sign-in (with its ?query), or the dashboard
      const from = location.state?.from;
      navigate(from ? `${from.pathname}${from.search || ''}` : '/dashboard', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Patients, doctors and clinic staff all sign in here."
      footer={<>New here? <Link to="/register" className="link">Create a patient account</Link></>}
    >
      {notice && (
        <div role="status" className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-900">{notice}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
        <div>
          <label htmlFor="login-email" className="label">E-mail</label>
          <input id="login-email" type="email" name="email" value={formData.email} onChange={handleChange}
            autoComplete="email" required className="input" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-700">Password</label>
            <Link to="/forgot-password" className="link text-sm">Forgot password?</Link>
          </div>
          <PasswordInput id="login-password" name="password" value={formData.password} onChange={handleChange}
            autoComplete="current-password" required />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
