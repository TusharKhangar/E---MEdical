// Every department that has at least one doctor, from the live doctor list.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { medicalService } from '../services/medicalService';
import { departmentsFromDoctors } from '../utils/departments';
import PageHeader from '../components/common/PageHeader';

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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader eyebrow="Departments" title="Our departments" subtitle="Every department below has doctors you can book today." />

      {loading ? (
        <p className="py-16 text-center text-slate-600">Loading departments…</p>
      ) : departments.length === 0 ? (
        <p className="py-16 text-center text-slate-600">No departments are listed yet.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map(({ name, Icon, description, doctorCount }) => (
            <li key={name} className="card flex flex-col p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{name}</h2>
              <p className="mt-1.5 flex-1 text-sm text-slate-600">{description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-600">{doctorCount} {doctorCount === 1 ? 'doctor' : 'doctors'}</span>
                <Link to={`/doctors?department=${encodeURIComponent(name)}`} className="link inline-flex items-center gap-1 text-sm">
                  See doctors <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Departments;
