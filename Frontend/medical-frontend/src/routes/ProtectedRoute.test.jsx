import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { STORAGE_KEYS } from '../utils/constants';

const signInAs = (role) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, 'token');
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ email: 'x@test.com', role }));
};

const renderAt = (path, element) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="/dashboard" element={<p>Dashboard home</p>} />
          <Route path="/dashboard/users" element={element} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

describe('ProtectedRoute', () => {
  const adminPage = (
    <ProtectedRoute requiredRole="ROLE_ADMIN">
      <p>Patients list</p>
    </ProtectedRoute>
  );

  it('sends signed-out visitors to the login page', () => {
    renderAt('/dashboard/users', adminPage);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('sends users without the role back to their dashboard', () => {
    signInAs('ROLE_USER');
    renderAt('/dashboard/users', adminPage);
    expect(screen.getByText('Dashboard home')).toBeInTheDocument();
  });

  it('shows the page to the right role', () => {
    signInAs('ROLE_ADMIN');
    renderAt('/dashboard/users', adminPage);
    expect(screen.getByText('Patients list')).toBeInTheDocument();
  });
});
