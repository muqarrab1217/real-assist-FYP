import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';

const clearAuth = () => {
  localStorage.clear();
};

describe('Route guards', () => {
  afterEach(() => {
    clearAuth();
  });

  it('ProtectedRoute redirects unauthenticated users to fallback', () => {
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it('ProtectedRoute allows access when authenticated with required role', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', 'u');
    localStorage.setItem('role', 'admin');

    render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <Routes>
          <Route
            path="/admin-only"
            element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth/login" element={<div>Login Page</div>} />
          <Route path="/client/dashboard" element={<div>Client Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/admin secret/i)).toBeInTheDocument();
  });

  it('ProtectedRoute redirects to role dashboard when role mismatches', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', 'u');
    localStorage.setItem('role', 'client');

    render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <Routes>
          <Route
            path="/admin-only"
            element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/client/dashboard" element={<div>Client Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/client dashboard/i)).toBeInTheDocument();
  });

  it('PublicRoute redirects authenticated users to role dashboard', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', 'u');
    localStorage.setItem('role', 'client');

    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <div>Login Form</div>
              </PublicRoute>
            }
          />
          <Route path="/client/dashboard" element={<div>Client Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/client dashboard/i)).toBeInTheDocument();
  });

  it('RoleBasedRoute blocks users without allowed role', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', 'u');
    localStorage.setItem('role', 'client');

    render(
      <MemoryRouter initialEntries={['/admin-zone']}>
        <Routes>
          <Route
            path="/admin-zone"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div>Admin Area</div>
              </RoleBasedRoute>
            }
          />
          <Route path="/client/dashboard" element={<div>Client Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/client dashboard/i)).toBeInTheDocument();
  });
});

