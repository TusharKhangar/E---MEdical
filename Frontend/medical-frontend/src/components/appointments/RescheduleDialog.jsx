// src/components/appointments/RescheduleDialog.jsx
// Lets a patient move an appointment to another free slot with the same doctor.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { medicalService, errorMessage } from '../../services/medicalService';
import Modal from '../common/Modal';
import SlotPicker from './SlotPicker';
import { addDaysIso, longDate, todayIso } from '../../utils/format';

const RescheduleDialog = ({ appointment, onClose, onDone }) => {
  const [date, setDate] = useState(appointment.date >= todayIso() ? appointment.date : addDaysIso(1));
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
      toast.success(`Moved to ${longDate(updated.date)} at ${updated.time}. The doctor will confirm the new time.`);
      onDone(updated);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not reschedule'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      as="form"
      onSubmit={submit}
      labelId="reschedule-title"
      onClose={onClose}
      title="Reschedule appointment"
      subtitle={`${appointment.doctorName} · now ${longDate(appointment.date)}, ${appointment.time}`}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Keep current time</button>
          <button type="submit" disabled={!time || saving} className="btn-primary">{saving ? 'Moving…' : 'Move appointment'}</button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="new-date" className="label">New date</label>
          <input id="new-date" type="date" required min={todayIso()} max={addDaysIso(90)} value={date}
            onChange={(e) => setDate(e.target.value)} className="input" />
        </div>
        <div>
          <p className="label">New time</p>
          <SlotPicker slots={slots} value={time} onChange={setTime} loading={loading} />
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleDialog;
