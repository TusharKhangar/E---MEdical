import { describe, expect, it } from 'vitest';
import { HeartPulse, Hospital } from 'lucide-react';
import { departmentInfo, departmentsFromDoctors } from './departments';

describe('departmentsFromDoctors', () => {
  it('lists only specializations that have doctors, sorted, with counts', () => {
    const departments = departmentsFromDoctors([
      { specialization: 'Pediatrics' },
      { specialization: 'Cardiology' },
      { specialization: 'Cardiology' },
      { specialization: null }
    ]);
    expect(departments.map((d) => [d.name, d.doctorCount])).toEqual([
      ['Cardiology', 2],
      ['Pediatrics', 1]
    ]);
    expect(departments[0].Icon).toBe(HeartPulse);
  });

  it('falls back to a generic look for unknown specializations', () => {
    expect(departmentInfo('Radiology')).toMatchObject({ name: 'Radiology', Icon: Hospital });
  });
});
