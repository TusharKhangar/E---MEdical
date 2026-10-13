// src/pages/MakeAppointment.jsx
// Booking in three steps on one page: doctor, day, time. ?doctorId=... preselects a doctor
// (the "Book" buttons on the public pages link here).
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarCheck } from 'lucide-react';
import { medicalService, errorMessage } from '../services/medicalService';
import DoctorAvatar from '../components/common/DoctorAvatar';
import SlotPicker from '../components/appointments/SlotPicker';
import { PageTitle } from '../components/dashboard/ui';
import { addDaysIso, longDate, todayIso } from '../utils/format';

const QUICK_DAYS = 14;

const dayChip = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return {
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    day: d.getDate(),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
  };
};

const Step = ({ n, title, children }) => (
  <section className="card p-5 sm:p-6" aria-labelledby={`step-${n}`}>
    <h2 id={`step-${n}`} className="flex items-center gap-3 text-sm font-semibold text-slate-900">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white">{n}</span>
      {title}
    </h2>
    <div className="mt-5">{children}</div>
  </section>
);

const MakeAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [allDoctors, setAllDoctors] = useState([]);
  const [department, setDepartment] = useState('');
  const [doctorId, setDoctorId] = useState(searchParams.get('doctorId') || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    medicalService.getDoctors()
      .then(setAllDoctors)
      .catch((error) => toast.error(errorMessage(error, 'Could not load doctors')));
  }, []);

  const departments = useMemo(
    () => [...new Set(allDoctors.map((d) => d.specialization).filter(Boolean))].sort(),
    [allDoctors]
  );
  const doctors = department ? allDoctors.filter((d) => d.specialization === department) : allDoctors;
  const doctor = allDoctors.find((d) => String(d.id) === String(doctorId)) || null;
  const quickDays = useMemo(() => Array.from({ length: QUICK_DAYS }, (_, i) => addDaysIso(i)), []);

  // Free times for the chosen doctor and day
  useEffect(() => {
    setTime('');
    if (!doctorId || !date) {
      setSlots([]);
      return undefined;
    }
    let cancelled = false;
    setSlotsLoading(true);
    medicalService.getDoctorSlots(doctorId, date)
      .then((r) => { if (!cancelled) setSlots(r.slots || []); })
      .catch((error) => { if (!cancelled) toast.error(errorMessage(error, 'Could not load free times')); })
      .finally(() => { if (!cancelled) setSlotsLoading(false); });
    return () => { cancelled = true; };
  }, [doctorId, date]);

  const chooseDepartment = (value) => {
    setDepartment(value);
    if (doctor && value && doctor.specialization !== value) setDoctorId('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!doctorId || !date || !time) {
      toast.error('Choose a doctor, a day and a time first');
      return;
    }
    setSaving(true);
    try {
      await medicalService.bookAppointment({ doctorId: Number(doctorId), date, time, description: message });
      toast.success('Booked. The doctor will confirm it shortly, and we’ll e-mail you.');
      navigate('/dashboard/appointments');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not book that time. Please try again.'));
      if (error.response?.status === 409) {
        // Someone took the slot a moment ago: refresh the list
        setTime('');
        medicalService.getDoctorSlots(doctorId, date).then((r) => setSlots(r.slots || [])).catch(() => {});
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <PageTitle title="Book an appointment" subtitle="Pick a doctor, then a day and one of their free times." />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Step n={1} title="Choose a doctor">
            <label htmlFor="book-department" className="label">Department</label>
            <select id="book-department" name="department" value={department} onChange={(e) => chooseDepartment(e.target.value)}
              className="input sm:w-72">
              <option value="">All departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <fieldset className="mt-4">
              <legend className="sr-only">Doctor</legend>
              {doctors.length === 0 ? (
                <p className="text-sm text-slate-600">No doctors are taking appointments yet.</p>
              ) : (
                <div className="grid max-h-96 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {doctors.map((d) => {
                    const selected = String(d.id) === String(doctorId);
                    return (
                      <label key={d.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                          selected ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-slate-200 hover:border-slate-300'
                        }`}>
                        <input type="radio" name="doctorId" value={d.id} checked={selected}
                          onChange={() => setDoctorId(String(d.id))} className="sr-only" />
                        <DoctorAvatar doctor={d} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900">Dr. {d.firstName} {d.lastName}</span>
                          <span className="block truncate text-xs text-slate-600">{d.specialization || 'General practice'}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          </Step>

          <Step n={2} title="Choose a day">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Next two weeks">
              {quickDays.map((iso) => {
                const c = dayChip(iso);
                const selected = iso === date;
                return (
                  <button type="button" key={iso} onClick={() => setDate(iso)} aria-pressed={selected}
                    aria-label={longDate(iso)}
                    className={`flex w-14 shrink-0 flex-col items-center rounded-lg border py-2 text-xs transition-colors ${
                      selected ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}>
                    <span>{c.weekday}</span>
                    <span className={`text-lg font-semibold ${selected ? 'text-white' : 'text-slate-900'}`}>{c.day}</span>
                    <span>{c.month}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <label htmlFor="book-date" className="text-sm text-slate-600">Or pick another date</label>
              <input id="book-date" type="date" name="date" value={date} min={todayIso()} max={addDaysIso(90)}
                onChange={(e) => setDate(e.target.value)} className="input w-auto" />
            </div>
          </Step>

          <Step n={3} title="Choose a time">
            {!doctorId || !date ? (
              <p className="text-sm text-slate-600">Choose a doctor and a day to see free times.</p>
            ) : (
              <SlotPicker slots={slots} value={time} onChange={setTime} loading={slotsLoading}
                emptyText="No free times that day, or the doctor isn’t working. Try another day." />
            )}
            <div className="mt-6">
              <label htmlFor="book-reason" className="label">Reason for the visit <span className="font-normal text-slate-600">(optional)</span></label>
              <textarea id="book-reason" name="message" rows="3" maxLength={255} value={message}
                onChange={(e) => setMessage(e.target.value)} className="input"
                placeholder="Symptoms, how long you’ve had them, anything the doctor should know" />
            </div>
          </Step>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-900">Your appointment</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Doctor</dt>
                <dd className="text-right font-medium text-slate-900">{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : '–'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Day</dt>
                <dd className="text-right font-medium text-slate-900">{date ? longDate(date) : '–'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Time</dt>
                <dd className="text-right font-medium text-slate-900">{time || '–'}</dd>
              </div>
            </dl>
            <button type="submit" disabled={saving || !time} className="btn-primary mt-5 w-full py-2.5">
              <CalendarCheck className="h-4 w-4" aria-hidden="true" /> {saving ? 'Booking…' : 'Book appointment'}
            </button>
            <p className="mt-3 text-xs text-slate-600">
              The doctor confirms each request. You’ll get an e-mail, and a reminder the evening before.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
};

export default MakeAppointment;
