import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { medicalService } from '../services/medicalService';
import { departmentsFromDoctors } from '../utils/departments';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medicalService.getDoctors()
      .then((doctors) => setDepartments(departmentsFromDoctors(doctors)))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800 mb-2"
        >
          Medical Departments
        </motion.h1>
        <p className="text-gray-600 mb-8">Every department below has doctors you can book today.</p>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No departments listed yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, idx) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white shadow rounded-xl p-8 text-slate-900 flex flex-col"
              >
                <div className="text-4xl mb-3">{dept.icon}</div>
                <h2 className="text-xl font-semibold mb-2 text-slate-900">{dept.name}</h2>
                <p className="text-gray-600 flex-1">{dept.description}</p>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm text-gray-500">
                    {dept.doctorCount} doctor{dept.doctorCount === 1 ? '' : 's'}
                  </span>
                  <Link
                    to={`/doctors?department=${encodeURIComponent(dept.name)}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    See doctors →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
