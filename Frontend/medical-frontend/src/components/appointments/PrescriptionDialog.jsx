// src/components/appointments/PrescriptionDialog.jsx
// The doctor finishes a visit: diagnosis, medicines and advice. Saving marks the visit completed.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { medicalService, errorMessage } from '../../services/medicalService';

const EMPTY_LINE = { name: '', dosage: '', frequency: '', durationDays: '' };
const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm';

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
          : [{ ...EMPTY_LINE }]
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
      toast.success('Visit completed and prescription saved');
      onSaved();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save the prescription'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="rx-title">
      <form onSubmit={submit} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl space-y-4">
        <div>
          <h2 id="rx-title" className="text-lg font-semibold text-gray-900">
            {appointment.hasPrescription ? 'Edit prescription' : 'Complete visit'}
          </h2>
          <p className="text-sm text-gray-600">{appointment.name} · {appointment.date} at {appointment.time}
            {appointment.description ? ` · ${appointment.description}` : ''}</p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <>
            <div>
              <label htmlFor="rx-diagnosis" className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
              <input id="rx-diagnosis" required maxLength={500} className={inputClass} value={form.diagnosis}
                onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Medicines</p>
              <div className="space-y-2">
                {form.medicines.map((m, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input aria-label="Medicine name" placeholder="Medicine" className={`${inputClass} col-span-12 sm:col-span-4`}
                      value={m.name} maxLength={120} onChange={(e) => setLine(i, { name: e.target.value })} />
                    <input aria-label="Dosage" placeholder="500 mg" className={`${inputClass} col-span-4 sm:col-span-2`}
                      value={m.dosage || ''} maxLength={60} onChange={(e) => setLine(i, { dosage: e.target.value })} />
                    <input aria-label="How often" placeholder="Twice a day" className={`${inputClass} col-span-5 sm:col-span-3`}
                      value={m.frequency || ''} maxLength={120} onChange={(e) => setLine(i, { frequency: e.target.value })} />
                    <input aria-label="Days" type="number" min="1" max="365" placeholder="Days" className={`${inputClass} col-span-2 sm:col-span-2`}
                      value={m.durationDays} onChange={(e) => setLine(i, { durationDays: e.target.value })} />
                    <button type="button" aria-label="Remove medicine" className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => setForm((f) => ({ ...f, medicines: f.medicines.filter((_, j) => j !== i) }))}>
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {form.medicines.length < 20 && (
                <button type="button" className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setForm((f) => ({ ...f, medicines: [...f.medicines, { ...EMPTY_LINE }] }))}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Add medicine
                </button>
              )}
            </div>

            <div>
              <label htmlFor="rx-notes" className="block text-sm font-medium text-gray-700 mb-1">Advice for the patient</label>
              <textarea id="rx-notes" rows="3" maxLength={2000} className={inputClass} value={form.notes}
                placeholder="Rest, diet, tests to take, warning signs..."
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            <div>
              <label htmlFor="rx-followup" className="block text-sm font-medium text-gray-700 mb-1">Follow-up date (optional)</label>
              <input id="rx-followup" type="date" min={appointment.date} className={`${inputClass} sm:w-56`} value={form.followUpDate}
                onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))} />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving || loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : appointment.hasPrescription ? 'Save changes' : 'Complete visit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionDialog;
