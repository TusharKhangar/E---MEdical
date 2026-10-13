// src/components/dashboard/DoctorAvailability.jsx
// Doctors set their weekly working hours and days off; patients only see slots inside them.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { medicalService, errorMessage } from '../../services/medicalService';
import { Empty, PageTitle, Panel, Spinner } from './ui';
import { longDate, todayIso } from '../../utils/format';

const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`); // 06:00 .. 22:00

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

  if (!week) return <Spinner />;

  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle title="Working hours" subtitle="Patients can only book inside these hours. 13:00 is kept free for lunch.">
        <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save hours'}</button>
      </PageTitle>

      <Panel title="Weekly hours">
        <ul className="divide-y divide-slate-100">
          {week.map((d) => (
            <li key={d.dayOfWeek} className="flex flex-wrap items-center gap-4 px-5 py-3">
              <label className="flex w-36 items-center gap-3 text-sm font-medium text-slate-900">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500" checked={d.working}
                  onChange={(e) => updateDay(d.dayOfWeek, { working: e.target.checked })} />
                {d.name}
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <select aria-label={`${d.name} start`} className="input w-auto py-1.5" value={d.startTime} disabled={!d.working}
                  onChange={(e) => updateDay(d.dayOfWeek, { startTime: e.target.value })}>
                  {HOURS.slice(0, -1).map((h) => <option key={h}>{h}</option>)}
                </select>
                <span>to</span>
                <select aria-label={`${d.name} end`} className="input w-auto py-1.5" value={d.endTime} disabled={!d.working}
                  onChange={(e) => updateDay(d.dayOfWeek, { endTime: e.target.value })}>
                  {HOURS.slice(1).map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
              <span className="ml-auto text-xs text-slate-600">{d.working ? `${slotCount(d)} slots` : 'Day off'}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Days off">
        <form onSubmit={addLeave} className="flex flex-wrap items-end gap-3 border-b border-slate-100 p-5">
          <div>
            <label htmlFor="leave-date" className="label">Date</label>
            <input id="leave-date" type="date" required min={todayIso()} value={leaveForm.date}
              onChange={(e) => setLeaveForm((f) => ({ ...f, date: e.target.value }))} className="input" />
          </div>
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="leave-reason" className="label">Reason <span className="font-normal text-slate-600">(optional)</span></label>
            <input id="leave-reason" maxLength={120} placeholder="Conference, personal leave…" value={leaveForm.reason}
              onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))} className="input" />
          </div>
          <button type="submit" className="btn-secondary">Add day off</button>
        </form>
        {leave.length === 0 ? (
          <Empty>No days off planned.</Empty>
        ) : (
          <ul className="divide-y divide-slate-100">
            {leave.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{longDate(l.date)}</p>
                  {l.reason && <p className="text-xs text-slate-600">{l.reason}</p>}
                </div>
                <button onClick={() => removeLeave(l.id)} className="btn-ghost px-2 text-slate-600 hover:text-red-700" aria-label="Remove day off">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default DoctorAvailability;
