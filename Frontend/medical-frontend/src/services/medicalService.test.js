import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() }
}));

import api from './api';
import { errorMessage, getAppointmentsForRole, medicalService, setAppointmentStatusForRole } from './medicalService';

describe('errorMessage', () => {
  it('uses the plain-text body the backend sends', () => {
    expect(errorMessage({ response: { data: 'That slot is already booked.' } })).toBe('That slot is already booked.');
  });

  it('reads a JSON message when there is one', () => {
    expect(errorMessage({ response: { data: { message: 'Nope' } } })).toBe('Nope');
  });

  it('explains a sleeping or restarting server instead of a vague failure', () => {
    expect(errorMessage({ message: 'Network Error' })).toMatch(/waking up/);
    expect(errorMessage({ response: { status: 503, data: '' } })).toMatch(/waking up/);
    expect(errorMessage({ response: { status: 502, data: '<html><body>Bad gateway</body></html>' } })).toMatch(/waking up/);
  });

  it('falls back when there is no usable body', () => {
    expect(errorMessage({ response: {} }, 'Fallback')).toBe('Fallback');
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

describe('server-side search', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset().mockResolvedValue({ data: { content: [], totalElements: 0 } });
  });

  it('only sends the filters the user actually set', async () => {
    await medicalService.searchAppointments({ q: '', status: 'PENDING', from: undefined, to: null, page: 0, size: 20 });
    expect(api.get).toHaveBeenCalledWith('/admin/appointments/search', {
      params: { status: 'PENDING', page: 0, size: 20 }
    });
  });

  it('asks for accounts by role', async () => {
    await medicalService.searchAccounts({ role: 'DOCTOR', q: 'cardio' });
    expect(api.get).toHaveBeenCalledWith('/admin/accounts', { params: { role: 'DOCTOR', q: 'cardio' } });
  });
});
