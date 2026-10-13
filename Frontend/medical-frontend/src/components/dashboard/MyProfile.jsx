// src/components/dashboard/MyProfile.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { medicalService, errorMessage } from '../../services/medicalService';
import { SPECIALIZATIONS } from '../../utils/constants';
import PasswordInput from '../common/PasswordInput';
import DoctorAvatar from '../common/DoctorAvatar';
import { PageTitle, Panel, Spinner } from './ui';

const MyProfile = () => {
  const { user, updateProfile, isDoctor } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', gender: '', specialization: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    medicalService.getProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phoneNumber: p.phoneNumber || '',
          gender: p.gender || '',
          specialization: p.specialization || ''
        });
      })
      .catch((error) => toast.error(errorMessage(error, 'Could not load your profile')));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phoneNumber && !/^[1-9][0-9]{9}$/.test(form.phoneNumber)) {
      toast.error('Please enter a 10-digit phone number');
      return;
    }
    setLoading(true);
    const result = await updateProfile(form);
    setLoading(false);
    if (result.success) {
      setProfile(prev => ({ ...prev, ...result.user }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('The new passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const message = await medicalService.changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success(message || 'Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (error) {
      toast.error(errorMessage(error, 'Could not change your password'));
    } finally {
      setChangingPassword(false);
    }
  };

  const ROLE_NAMES = { ROLE_ADMIN: 'Administrator', ROLE_DOCTOR: 'Doctor', ROLE_USER: 'Patient' };

  if (!profile) return <Spinner />;

  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle title="My profile" subtitle="Your details are only visible to you, your doctors and clinic staff." />

      <Panel>
        <div className="flex items-center gap-4 border-b border-slate-100 p-5">
          <DoctorAvatar doctor={profile} size="h-14 w-14 text-lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">{profile.firstName} {profile.lastName}</p>
            <p className="truncate text-sm text-slate-600">{profile.email} · {ROLE_NAMES[profile.role || user?.role] || 'Account'}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-first" className="label">First name</label>
              <input id="profile-first" name="firstName" value={form.firstName} onChange={handleInputChange} required className="input" />
            </div>
            <div>
              <label htmlFor="profile-last" className="label">Last name</label>
              <input id="profile-last" name="lastName" value={form.lastName} onChange={handleInputChange} required className="input" />
            </div>
            <div>
              <label htmlFor="profile-phone" className="label">Phone</label>
              <input id="profile-phone" type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange}
                inputMode="numeric" placeholder="10 digits" className="input" />
            </div>
            <div>
              <label htmlFor="profile-gender" className="label">Gender</label>
              <select id="profile-gender" name="gender" value={form.gender} onChange={handleInputChange} className="input">
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            {isDoctor() && (
              <div>
                <label htmlFor="profile-spec" className="label">Specialization</label>
                <select id="profile-spec" name="specialization" value={form.specialization} onChange={handleInputChange} className="input">
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end border-t border-slate-100 px-5 py-4">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </Panel>

      <Panel title="Change password">
        <form onSubmit={handlePasswordChange}>
          <div className="grid gap-5 p-5 sm:grid-cols-3">
            <div>
              <label htmlFor="pw-current" className="label">Current password</label>
              <PasswordInput id="pw-current" value={passwords.currentPassword} autoComplete="current-password" required
                onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="pw-new" className="label">New password</label>
              <PasswordInput id="pw-new" value={passwords.newPassword} autoComplete="new-password" required
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="pw-confirm" className="label">Repeat new password</label>
              <PasswordInput id="pw-confirm" value={passwords.confirm} autoComplete="new-password" required
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-100 px-5 py-4">
            <button type="submit" disabled={changingPassword} className="btn-secondary">
              {changingPassword ? 'Changing…' : 'Change password'}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
};

export default MyProfile;
