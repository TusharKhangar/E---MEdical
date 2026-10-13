// src/components/appointments/PrescriptionDialog.jsx
// The doctor finishes a visit: diagnosis, medicines and advice. Saving marks the visit completed.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { medicalService, errorMessage } from '../../services/medicalService';
import Modal from '../common/Modal';
import { longDate } from '../../utils/format';

const EMPTY_LINE = { name: '', dosage: '', frequency: '', durationDays: '' };

const PrescriptionDialog = ({ appointment, onClose, onSaved }) => {
  const [form, setForm] = useState({ diagnosis: '', notes: '', followUpDate: '', medicines: [{ ...EMPTY_LINE }] });
  const [loading, setLoading] = useState(Boolean(appointment.hasPrescription));
  const [saving, setSaving] = useState(false);

  // Editing an existing prescription: load it first
  useEffect(() => {
    if (!appointment.hasPrescription) return;
    medicalService.getPrescription(appointment.id)
      .then((p) => setForm({
        diagnosis: p.diagnosis || '',
        notes: p.notes || '',
        followUpDate: p.followUpDate || '',
        medicines: p.medicines.length
          ? p.medicines.map((m) => ({ ...EMPTY_LINE, ...m, durationDays: m.durationDays ?? '' }))
          : [{ ...EMPTY_LINE }],
      }))
      .catch((error) => toast.error(errorMessage(error, 'Could not load the prescription')))
      .finally(() => setLoading(false));
  }, [appointment.id, appointment.hasPrescription]);

  const setLine = (index, changes) =>
    setForm((f) => ({ ...f, medicines: f.medicines.map((m, i) => (i === index ? { ...m, ...changes } : m)) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const medicines = form.medicines
        .filter((m) => m.name.trim())
        .map((m) => ({ ...m, durationDays: m.durationDays === '' ? null : Number(m.durationDays) }));
      await medicalService.savePrescription(appointment.id, { ...form, medicines });
      toast.success(appointment.hasPrescription ? 'Prescription updated' : 'Visit completed and prescription saved');
      onSaved();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save the prescription'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      as="form"
      onSubmit={submit}
      labelId="rx-title"
      size="max-w-2xl"
      onClose={onClose}
      title={appointment.hasPrescription ? 'Edit prescription' : 'Complete visit'}
      subtitle={`${appointment.name} · ${longDate(appointment.date)}, ${appointment.time}${appointment.description ? ` · ${appointment.description}` : ''}`}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving || loading} className="btn-primary">
            {saving ? 'Saving…' : appointment.hasPrescription ? 'Save changes' : 'Complete visit'}
          </button>
        </>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : (
        <div className="space-y-5">
          <div>
            <label htmlFor="rx-diagnosis" className="label">Diagnosis</label>
            <input id="rx-diagnosis" required maxLength={500} className="input" value={form.diagnosis}
              onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} />
          </div>

          <fieldset>
            <legend className="label">Medicines</legend>
            <div className="hidden grid-cols-12 gap-2 px-0.5 pb-1 text-xs font-medium text-slate-600 sm:grid">
              <span className="col-span-4">Name</span><span className="col-span-2">Dose</span>
              <span className="col-span-3">How often</span><span className="col-span-2">Days</span>
            </div>
            <div className="space-y-2">
              {form.medicines.map((m, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <input aria-label="Medicine name" placeholder="Paracetamol" className="input col-span-12 sm:col-span-4"
                    value={m.name} maxLength={120} onChange={(e) => setLine(i, { name: e.target.value })} />
                  <input aria-label="Dosage" placeholder="500 mg" className="input col-span-4 sm:col-span-2"
                    value={m.dosage || ''} maxLength={60} onChange={(e) => setLine(i, { dosage: e.target.value })} />
                  <input aria-label="How often" placeholder="Twice a day" className="input col-span-5 sm:col-span-3"
                    value={m.frequency || ''} maxLength={120} onChange={(e) => setLine(i, { frequency: e.target.value })} />
                  <input aria-label="Days" type="number" min="1" max="365" placeholder="5" className="input col-span-2"
                    value={m.durationDays} onChange={(e) => setLine(i, { durationDays: e.target.value })} />
                  <button type="button" aria-label="Remove medicine" className="btn-ghost col-span-1 px-2 text-slate-600 hover:text-red-700"
                    onClick={() => setForm((f) => ({ ...f, medicines: f.medicines.filter((_, j) => j !== i) }))}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {form.medicines.length < 20 && (
              <button type="button" className="btn-ghost btn-sm mt-2 text-brand-700"
                onClick={() => setForm((f) => ({ ...f, medicines: [...f.medicines, { ...EMPTY_LINE }] }))}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add medicine
              </button>
            )}
          </fieldset>

          <div>
            <label htmlFor="rx-notes" className="label">Advice for the patient</label>
            <textarea id="rx-notes" rows="3" maxLength={2000} className="input" value={form.notes}
              placeholder="Rest, diet, tests to take, warning signs…"
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>

          <div>
            <label htmlFor="rx-followup" className="label">Follow-up date <span className="font-normal text-slate-600">(optional)</span></label>
            <input id="rx-followup" type="date" min={appointment.date} className="input sm:w-56" value={form.followUpDate}
              onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))} />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PrescriptionDialog;
