import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() }
}));

import api from './api';
import { errorMessage, getAppointmentsForRole, setAppointmentStatusForRole } from './medicalService';

describe('errorMessage', () => {
  it('uses the plain-text body the backend sends', () => {
    expect(errorMessage({ response: { data: 'That slot is already booked.' } })).toBe('That slot is already booked.');
  });

  it('reads a JSON message when there is one', () => {
    expect(errorMessage({ response: { data: { message: 'Nope' } } })).toBe('Nope');
  });

  it('falls back when there is no usable body', () => {
    expect(errorMessage({}, 'Fallback')).toBe('Fallback');
    expect(errorMessage({ response: { data: '   ' } }, 'Fallback')).toBe('Fallback');
  });
});

describe('role-based appointment calls', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
  });

  it('asks each role for its own appointments', async () => {
    await getAppointmentsForRole('ROLE_ADMIN');
    await getAppointmentsForRole('ROLE_DOCTOR');
    await getAppointmentsForRole('ROLE_USER');
    expect(vi.mocked(api.get).mock.calls.map((c) => c[0])).toEqual([
      '/admin/appointments',
      '/doctor/appointments',
      '/user/appointments'
    ]);
  });

  it('patients can only cancel; staff set any status', async () => {
    await setAppointmentStatusForRole('ROLE_USER', 7, 'CANCELLED');
    await setAppointmentStatusForRole('ROLE_DOCTOR', 7, 'CONFIRMED');
    await setAppointmentStatusForRole('ROLE_ADMIN', 7, 'COMPLETED');
    expect(vi.mocked(api.patch).mock.calls).toEqual([
      ['/user/appointments/7/cancel'],
      ['/doctor/appointments/7/status', { status: 'CONFIRMED' }],
      ['/admin/appointments/7/status', { status: 'COMPLETED' }]
    ]);
  });
});
