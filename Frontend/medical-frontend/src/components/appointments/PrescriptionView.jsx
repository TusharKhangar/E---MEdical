// src/components/appointments/PrescriptionView.jsx
// Read-only prescription with a PDF download, for the patient, their doctor and admins.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { medicalService, errorMessage } from '../../services/medicalService';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="rxv-title">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl space-y-5">
        {!p ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="rxv-title" className="text-lg font-semibold text-gray-900">Prescription</h2>
                <p className="text-sm text-gray-600">{p.doctorName}{p.department ? ` · ${p.department}` : ''} · {p.visitDate} at {p.visitTime}</p>
                <p className="text-sm text-gray-600">Patient: {p.patientName}</p>
              </div>
              <button onClick={download} disabled={downloading}
                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> {downloading ? 'Preparing...' : 'Download PDF'}
              </button>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Diagnosis</h3>
              <p className="text-gray-900">{p.diagnosis}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Medicines</h3>
              {p.medicines.length === 0 ? (
                <p className="text-sm text-gray-600">No medicines prescribed.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 pr-3">Medicine</th><th className="py-2 pr-3">Dosage</th><th className="py-2 pr-3">How often</th><th className="py-2">Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.medicines.map((m, i) => (
                        <tr key={i} className="border-b last:border-0 text-gray-800">
                          <td className="py-2 pr-3 font-medium">{m.name}</td>
                          <td className="py-2 pr-3">{m.dosage || '—'}</td>
                          <td className="py-2 pr-3">{m.frequency || '—'}</td>
                          <td className="py-2">{m.durationDays ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {p.notes && (
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Advice</h3>
                <p className="text-gray-800 whitespace-pre-line">{p.notes}</p>
              </section>
            )}

            {p.followUpDate && (
              <p className="text-sm text-blue-800 bg-blue-50 rounded-lg px-3 py-2">Follow-up visit recommended on {p.followUpDate}.</p>
            )}
          </>
        )}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;
