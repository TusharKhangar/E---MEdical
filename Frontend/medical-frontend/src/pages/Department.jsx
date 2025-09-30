import React from 'react';
import Header from '../components/common/Header';
import { motion } from 'framer-motion';

const departments = [
  { name: "Cardiology", icon: "💓", description: "Expert heart care and cardiovascular treatments." },
  { name: "Neurology", icon: "🧠", description: "Brain and nervous system specialists." },
  { name: "Diagnostic", icon: "🔬", description: "Lab and imaging services." },
  { name: "Dental", icon: "🦷", description: "Comprehensive dental care." },
  { name: "Ophthalmology", icon: "👁️", description: "Vision and eye health services." },
  { name: "Emergency", icon: "🚨", description: "24/7 medical emergencies." },
];

const Departments = () => (
  <div className="min-h-screen bg-gray-50">
   <div className="container mx-auto px-4 py-16">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-8"
      >
        Medical Departments
      </motion.h1>
      <div className="grid md:grid-cols-3 gap-8">
        {departments.map((dept, idx) => (
          <motion.div
            key={dept.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white shadow rounded-xl p-8 text-slate-900"
          >
            <div className="text-4xl mb-3">{dept.icon}</div>
            <h2 className="text-xl font-semibold mb-2 text-slate-900">{dept.name}</h2>
            <p className="text-gray-600 ">{dept.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
export default Departments;
