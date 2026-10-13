// src/pages/EmailConfirmation.jsx
// The link in the sign-up e-mail lands here. A valid link goes straight on to choosing a password.
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../services/api';
import AuthLayout from '../components/common/AuthLayout';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [failed, setFailed] = useState(!token);

  useEffect(() => {
    if (!token) return;
    api.get('/confirm', { params: { token } })
      .then(() => navigate(`/set-password?token=${encodeURIComponent(token)}`, { replace: true }))
      .catch(() => setFailed(true));
  }, [token, navigate]);

  if (!failed) {
    return (
      <AuthLayout standalone title="Confirming your e-mail…">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> One moment.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      standalone
      title="This link doesn’t work any more"
      subtitle="Confirmation links work once. If you already chose a password, just sign in. Otherwise sign up again to get a new link."
    >
      <div className="flex flex-wrap gap-3">
        <Link to="/login" className="btn-primary">Sign in</Link>
        <Link to="/register" className="btn-secondary">Sign up again</Link>
      </div>
    </AuthLayout>
  );
};

export default EmailConfirmation;
