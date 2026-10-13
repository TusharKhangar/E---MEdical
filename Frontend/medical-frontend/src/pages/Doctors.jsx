import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { medicalService } from '../services/medicalService';
import { useAuth } from '../context/AuthContext';

const ICONS = { MALE: '👨‍⚕️', FEMALE: '👩‍⚕️' };

const Doctors = () => {
  const { isAuthenticated, isPatient } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medicalService.getDoctors()
      .then(setDoctors)
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const departments = useMemo(
    () => [...new Set(doctors.map(d => d.specialization).filter(Boolean))].sort(),
    [doctors]
  );
  const visible = department ? doctors.filter(d => d.specialization === department) : doctors;
  const bookLink = isAuthenticated && isPatient() ? '/dashboard/make-appointment' : '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-800"
          >
            Our Doctors
          </motion.h1>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
          >
            <option value="">All departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading doctors...</div>
        ) : visible.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No doctors listed yet.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {visible.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white shadow rounded-xl p-8 text-center"
              >
                <div className="text-5xl mb-3">{ICONS[doc.gender] || '🩺'}</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">Dr. {doc.firstName} {doc.lastName}</h2>
                <div className="text-blue-600 mb-4">{doc.specialization || 'General practice'}</div>
                <Link to={bookLink} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Book Appointment
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
