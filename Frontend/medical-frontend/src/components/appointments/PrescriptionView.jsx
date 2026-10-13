// src/components/appointments/PrescriptionView.jsx
// Read-only prescription with a PDF download, for the patient, their doctor and admins.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, Download } from 'lucide-react';
import { medicalService, errorMessage } from '../../services/medicalService';
import Modal from '../common/Modal';
import { longDate } from '../../utils/format';

const PrescriptionView = ({ appointmentId, onClose }) => {
  const [p, setP] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    medicalService.getPrescription(appointmentId)
      .then(setP)
      .catch((error) => { toast.error(errorMessage(error, 'Could not load the prescription')); onClose(); });
  }, [appointmentId, onClose]);

  const download = async () => {
    setDownloading(true);
    try {
      await medicalService.downloadPrescriptionPdf(appointmentId);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not download the PDF'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      labelId="rxv-title"
      size="max-w-2xl"
      onClose={onClose}
      title="Prescription"
      subtitle={p ? `${p.doctorName}${p.department ? ` · ${p.department}` : ''} · ${longDate(p.visitDate)}, ${p.visitTime}` : 'Loading…'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Close</button>
          <button onClick={download} disabled={!p || downloading} className="btn-primary">
            <Download className="h-4 w-4" aria-hidden="true" /> {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
        </>
      }
    >
      {!p ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : (
        <div className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-600">Patient</dt>
              <dd className="mt-1 text-sm text-slate-900">{p.patientName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-600">Diagnosis</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{p.diagnosis}</dd>
            </div>
          </dl>

          <section>
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600">Medicines</h3>
            {p.medicines.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No medicines prescribed.</p>
            ) : (
              <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Medicine</th>
                      <th className="px-3 py-2 font-medium">Dose</th>
                      <th className="px-3 py-2 font-medium">How often</th>
                      <th className="px-3 py-2 font-medium">Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {p.medicines.map((m, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium text-slate-900">{m.name}</td>
                        <td className="px-3 py-2">{m.dosage || '–'}</td>
                        <td className="px-3 py-2">{m.frequency || '–'}</td>
                        <td className="px-3 py-2">{m.durationDays ?? '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {p.notes && (
            <section>
              <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600">Advice</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-800">{p.notes}</p>
            </section>
          )}

          {p.followUpDate && (
            <p className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-900">
              <CalendarClock className="h-4 w-4" aria-hidden="true" /> Follow-up visit recommended on {longDate(p.followUpDate)}.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PrescriptionView;
