import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import { STORAGE_KEYS } from '../../utils/constants';

const renderFor = (role) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, 'token');
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ email: 'x@test.com', firstName: 'Asha', role }));
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardSidebar />
      </MemoryRouter>
    </AuthProvider>
  );
};

// Each menu link is an icon span followed by a label span
const menuLabels = () =>
  screen.getAllByRole('link').map((a) => a.querySelector('span:last-child')?.textContent ?? a.textContent);

describe('DashboardSidebar', () => {
  it('shows admin tools only to administrators', () => {
    renderFor('ROLE_ADMIN');
    expect(menuLabels()).toEqual(expect.arrayContaining(['Patients', 'Doctors', 'Add Doctor', 'Messages']));
  });

  it('shows patients booking, not admin tools', () => {
    renderFor('ROLE_USER');
    const labels = menuLabels();
    expect(labels).toEqual(expect.arrayContaining(['My Appointments', 'Book Appointment']));
    expect(labels).not.toContain('Add Doctor');
  });

  it('shows doctors their schedule', () => {
    renderFor('ROLE_DOCTOR');
    const labels = menuLabels();
    expect(labels).toContain('My Schedule');
    expect(labels).not.toContain('Book Appointment');
  });
});
