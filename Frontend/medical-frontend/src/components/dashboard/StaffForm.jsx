// src/components/dashboard/StaffForm.jsx
// Shared form for adding a doctor or an administrator. The new person gets an e-mail with a
// link to choose their own password, so no password is typed here.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/medicalService';
import { SPECIALIZATIONS } from '../../utils/constants';
import { PageTitle } from './ui';

const EMPTY = { firstName: '', lastName: '', email: '', gender: 'MALE', phoneNumber: '', specialization: '' };

const StaffForm = ({ kind, title, description, submit, listPath }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const isDoctor = kind === 'doctor';

  if (!isAdmin()) {
    return <p className="card p-8 text-center text-slate-600">Only administrators can add {kind}s.</p>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phoneNumber && !/^[1-9][0-9]{9}$/.test(formData.phoneNumber)) {
      toast.error('Please enter a 10-digit phone number');
      return;
    }
    if (isDoctor && !formData.specialization) {
      toast.error('Please choose a specialization');
      return;
    }
    setLoading(true);
    try {
      const body = { ...formData, phoneNumber: formData.phoneNumber || null };
      if (!isDoctor) delete body.specialization;
      const created = await submit(body);
      toast.success(`${created.firstName} ${created.lastName} added. They have been e-mailed a link to set a password.`);
      setFormData(EMPTY);
      navigate(listPath);
    } catch (error) {
      toast.error(errorMessage(error, `Failed to add ${kind}`));
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, props = {}, hint) => (
    <div>
      <label htmlFor={`staff-${name}`} className="label">{label}</label>
      <input id={`staff-${name}`} name={name} value={formData[name]} onChange={handleInputChange} className="input" {...props} />
      {hint && <p className="mt-1.5 text-xs text-slate-600">{hint}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <PageTitle title={title} subtitle={description} />
      <form onSubmit={handleSubmit} className="card">
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          {field('firstName', 'First name', { required: true, autoComplete: 'off' })}
          {field('lastName', 'Last name', { required: true, autoComplete: 'off' })}
          {field('email', 'Work e-mail', { type: 'email', required: true, autoComplete: 'off' }, 'The invitation goes here.')}
          {field('phoneNumber', 'Phone', { type: 'tel', inputMode: 'numeric', placeholder: '10 digits' }, 'Optional.')}
          <div>
            <label htmlFor="staff-gender" className="label">Gender</label>
            <select id="staff-gender" name="gender" value={formData.gender} onChange={handleInputChange} className="input">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          {isDoctor && (
            <div>
              <label htmlFor="staff-specialization" className="label">Specialization</label>
              <select id="staff-specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} required className="input">
                <option value="">Choose one</option>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="mx-6 flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
          <p>The account stays switched off until the new {kind} opens the invitation e-mail and chooses a password.</p>
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={() => setFormData(EMPTY)} className="btn-secondary">Clear</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Sending invitation…' : `Invite ${isDoctor ? 'doctor' : 'administrator'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;
