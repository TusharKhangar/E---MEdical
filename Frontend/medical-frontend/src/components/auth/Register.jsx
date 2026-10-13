// src/components/auth/Register.jsx
// Patient sign-up. No password here: the confirmation e-mail links to a page where the patient chooses one,
// which also proves they own the address.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../common/AuthLayout';

const EMPTY = { firstName: '', lastName: '', email: '', phoneNumber: '', gender: '' };

const Register = () => {
  const [formData, setFormData] = useState(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await register({ ...formData, role: 'ROLE_USER' });
    setIsLoading(false);
    if (result.success) {
      navigate('/login', {
        state: { message: `We sent a confirmation link to ${formData.email}. Open it to choose your password, then sign in.` },
      });
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="We’ll e-mail you a link to confirm your address and choose a password."
      footer={<>Already have an account? <Link to="/login" className="link">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-first" className="label">First name</label>
            <input id="reg-first" name="firstName" value={formData.firstName} onChange={handleChange}
              autoComplete="given-name" required maxLength={60} className="input" />
          </div>
          <div>
            <label htmlFor="reg-last" className="label">Last name</label>
            <input id="reg-last" name="lastName" value={formData.lastName} onChange={handleChange}
              autoComplete="family-name" required maxLength={60} className="input" />
          </div>
        </div>
        <div>
          <label htmlFor="reg-email" className="label">E-mail</label>
          <input id="reg-email" type="email" name="email" value={formData.email} onChange={handleChange}
            autoComplete="email" required className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-phone" className="label">Mobile number</label>
            <input id="reg-phone" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
              autoComplete="tel-national" inputMode="numeric" pattern="[1-9][0-9]{9}" title="10 digits, not starting with 0"
              placeholder="10 digits" required className="input" />
          </div>
          <div>
            <label htmlFor="reg-gender" className="label">Gender <span className="font-normal text-slate-600">(optional)</span></label>
            <select id="reg-gender" name="gender" value={formData.gender} onChange={handleChange} className="input">
              <option value="">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
