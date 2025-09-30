import React from 'react';
import Header from '../components/common/Header';
import { motion } from 'framer-motion';

const doctors = [
  { name: "Dr. Sarah Johnson", specialty: "Cardiology", bio: "Expert in heart care.", icon: "👩‍⚕️" },
  { name: "Dr. Michael Chen", specialty: "Neurology", bio: "Specialist in brain health.", icon: "👨‍⚕️" },
  { name: "Dr. Emily Rodriguez", specialty: "Dental", bio: "Comprehensive dental services.", icon: "🦷" },
];

const Doctors = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-4 py-16">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-8"
      >
        Our Doctors
      </motion.h1>
      <div className="grid md:grid-cols-3 gap-8">
        {doctors.map((doc, idx) => (
          <motion.div
            key={doc.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white shadow rounded-xl p-8 text-center"
          >
            <div className="text-5xl mb-3">{doc.icon}</div>
            <h2 className="text-xl font-semibold mb-1">{doc.name}</h2>
            <div className="text-blue-600 mb-2">{doc.specialty}</div>
            <p className="text-gray-600">{doc.bio}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
export default Doctors;
