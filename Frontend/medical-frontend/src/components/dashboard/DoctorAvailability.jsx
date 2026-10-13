// src/components/dashboard/DoctorAvailability.jsx
// Doctors set their weekly working hours and days off; patients only see slots inside them.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClockIcon, CalendarDaysIcon, TrashIcon } from '@heroicons/react/24/outline';
import { medicalService, errorMessage } from '../../services/medicalService';

const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`); // 06:00 .. 22:00

const today = () => new Date().toISOString().split('T')[0];

const DoctorAvailability = () => {
  const [week, setWeek] = useState(null);
  const [saving, setSaving] = useState(false);
  const [leave, setLeave] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ date: '', reason: '' });

  useEffect(() => {
    Promise.all([medicalService.getMySchedule(), medicalService.getMyLeave()])
      .then(([w, l]) => { setWeek(w); setLeave(l); })
      .catch((error) => toast.error(errorMessage(error, 'Could not load your availability')));
  }, []);

  const updateDay = (dayOfWeek, changes) =>
    setWeek((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...changes } : d)));

  const save = async () => {
    setSaving(true);
    try {
      setWeek(await medicalService.updateMySchedule(week));
      toast.success('Working hours saved');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your working hours'));
    } finally {
      setSaving(false);
    }
  };

  const addLeave = async (e) => {
    e.preventDefault();
    try {
      const created = await medicalService.addLeave(leaveForm.date, leaveForm.reason);
      setLeave((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      setLeaveForm({ date: '', reason: '' });
      toast.success('Day off added');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not add the day off'));
    }
  };

  const removeLeave = async (id) => {
    try {
      await medicalService.removeLeave(id);
      setLeave((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      toast.error(errorMessage(error, 'Could not remove the day off'));
    }
  };

  const slotCount = (d) => {
    if (!d.working) return 0;
    const start = parseInt(d.startTime, 10);
    const end = parseInt(d.endTime, 10);
    return Math.max(0, end - start - (start <= 13 && end > 13 ? 1 : 0));
  };

  if (!week) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectClass = 'px-2 py-1 border border-gray-300 rounded-lg text-gray-800 disabled:bg-gray-100 disabled:text-gray-400';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Working hours</h1>
              <p className="text-sm text-gray-600">Patients can book hourly slots inside these hours. 13:00 to 14:00 is always lunch.</p>
            </div>
          </div>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
            {saving ? 'Saving...' : 'Save hours'}
          </button>
        </div>
        <ul className="divide-y divide-gray-100">
          {week.map((d) => (
            <li key={d.dayOfWeek} className="px-6 py-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center w-36 font-medium text-gray-800">
                <input type="checkbox" className="mr-3 h-4 w-4" checked={d.working}
                  onChange={(e) => updateDay(d.dayOfWeek, { working: e.target.checked })} />
                {d.name}
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <select aria-label={`${d.name} start`} className={selectClass} value={d.startTime} disabled={!d.working}
                  onChange={(e) => updateDay(d.dayOfWeek, { startTime: e.target.value })}>
                  {HOURS.slice(0, -1).map((h) => <option key={h}>{h}</option>)}
                </select>
                to
                <select aria-label={`${d.name} end`} className={selectClass} value={d.endTime} disabled={!d.working}
                  onChange={(e) => updateDay(d.dayOfWeek, { endTime: e.target.value })}>
                  {HOURS.slice(1).map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
              <span className="text-xs text-gray-500 ml-auto">
                {d.working ? `${slotCount(d)} slots` : 'Day off'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center">
          <CalendarDaysIcon className="h-6 w-6 text-orange-500 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Days off</h2>
            <p className="text-sm text-gray-600">No slots are offered on these dates. Cancel any appointments that day first.</p>
          </div>
        </div>
        <form onSubmit={addLeave} className="px-6 py-4 flex flex-wrap items-end gap-3 border-b border-gray-100">
          <div>
            <label htmlFor="leave-date" className="block text-sm text-gray-700 mb-1">Date</label>
            <input id="leave-date" type="date" min={today()} required value={leaveForm.date}
              onChange={(e) => setLeaveForm((f) => ({ ...f, date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800" />
          </div>
          <div className="flex-1 min-w-[12rem]">
            <label htmlFor="leave-reason" className="block text-sm text-gray-700 mb-1">Reason (optional)</label>
            <input id="leave-reason" maxLength={120} value={leaveForm.reason} placeholder="Conference, personal leave..."
              onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800" />
          </div>
          <button type="submit" className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">Add day off</button>
        </form>
        {leave.length === 0 ? (
          <p className="px-6 py-6 text-sm text-gray-500">No upcoming days off.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {leave.map((l) => (
              <li key={l.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(l.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {l.reason && <p className="text-sm text-gray-500">{l.reason}</p>}
                </div>
                <button onClick={() => removeLeave(l.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" aria-label="Remove day off">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailability;
