// Public doctor directory. The department filter lives in the URL (?department=...), so other pages
// can link straight to one department.
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { medicalService } from '../services/medicalService';
import { useAuth } from '../context/AuthContext';
import DoctorAvatar from '../components/common/DoctorAvatar';
import PageHeader from '../components/common/PageHeader';

const Doctors = () => {
  const { isAuthenticated, isPatient } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const department = searchParams.get('department') || '';
  const setDepartment = (value) => setSearchParams(value ? { department: value } : {});

  useEffect(() => {
    medicalService.getDoctors()
      .then(setDoctors)
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const departments = useMemo(
    () => [...new Set(doctors.map((d) => d.specialization).filter(Boolean))].sort(),
    [doctors]
  );
  const q = query.trim().toLowerCase();
  const visible = doctors
    .filter((d) => !department || d.specialization === department)
    .filter((d) => !q || `${d.firstName} ${d.lastName} ${d.specialization || ''}`.toLowerCase().includes(q));

  // Staff can't book; everyone else goes to booking (sign-in first if needed)
  const canBook = !isAuthenticated || isPatient();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader eyebrow="Doctors" title="Find a doctor" subtitle="Every doctor here is taking appointments. Pick one to see their free times." />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search by name</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or speciality"
            className="input pl-9"
          />
        </label>
        <label className="sm:w-64">
          <span className="sr-only">Filter by department</span>
          <select aria-label="Filter by department" value={department} onChange={(e) => setDepartment(e.target.value)} className="input">
            <option value="">All departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="py-16 text-center text-slate-600">Loading doctors…</p>
      ) : visible.length === 0 ? (
        <p className="py-16 text-center text-slate-600">
          {doctors.length === 0 ? 'No doctors are listed yet.' : 'No doctor matches that search.'}
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-600">{visible.length} {visible.length === 1 ? 'doctor' : 'doctors'}</p>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((doc) => (
              <li key={doc.id} className="card flex items-center gap-4 p-5">
                <DoctorAvatar doctor={doc} size="h-12 w-12 text-base" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-slate-900">Dr. {doc.firstName} {doc.lastName}</h2>
                  <p className="truncate text-sm text-slate-600">{doc.specialization || 'General practice'}</p>
                </div>
                {canBook && (
                  <Link to={`/dashboard/make-appointment?doctorId=${doc.id}`} className="btn-secondary btn-sm">
                    Book
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Doctors;
