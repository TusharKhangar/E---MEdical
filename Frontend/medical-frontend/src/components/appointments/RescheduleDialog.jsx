// src/components/appointments/RescheduleDialog.jsx
// Lets a patient move an appointment to another free slot with the same doctor.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { medicalService, errorMessage } from '../../services/medicalService';

const isoDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const RescheduleDialog = ({ appointment, onClose, onDone }) => {
  const [date, setDate] = useState(appointment.date >= isoDate(0) ? appointment.date : isoDate(1));
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setTime('');
    medicalService.getDoctorSlots(appointment.doctorId, date)
      .then((r) => { if (!cancelled) setSlots(r.slots || []); })
      .catch((error) => { if (!cancelled) toast.error(errorMessage(error, 'Could not load free slots')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [appointment.doctorId, date]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await medicalService.rescheduleMyAppointment(appointment.id, date, time);
      toast.success(`Moved to ${updated.date} at ${updated.time}. The doctor will confirm the new time.`);
      onDone(updated);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not reschedule'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="reschedule-title">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
        <div>
          <h2 id="reschedule-title" className="text-lg font-semibold text-gray-900">Reschedule appointment</h2>
          <p className="text-sm text-gray-600">
            {appointment.doctorName} · currently {appointment.date} at {appointment.time}
          </p>
        </div>
        <div>
          <label htmlFor="new-date" className="block text-sm font-medium text-gray-700 mb-1">New date</label>
          <input id="new-date" type="date" required min={isoDate(0)} max={isoDate(90)} value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800" />
        </div>
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">New time</p>
          {loading ? (
            <p className="text-sm text-gray-500">Loading free slots...</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-red-600">No free slots that day. Try another date.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => (
                <button type="button" key={s} onClick={() => setTime(s)}
                  className={`px-2 py-2 rounded-lg text-sm border ${time === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Keep current time</button>
          <button type="submit" disabled={!time || saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Moving...' : 'Move appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RescheduleDialog;
