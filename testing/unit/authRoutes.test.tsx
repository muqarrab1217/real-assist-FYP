import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

const clearAuth = () => {
  localStorage.clear();
};

describe('Route guards', () => {
  afterEach(() => {
    clearAuth();
  });

  it('ProtectedRoute redirects unauthenticated users to fallback', async () => {
    render(
      <AuthProvider>
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
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/login page/i)).toBeInTheDocument();
    });
  });

  it('ProtectedRoute allows access when authenticated with required role', async () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', role: 'admin' }));
    localStorage.setItem('role', 'admin');

    // Mock supabase to return a session
    const { supabase } = await import('@/lib/supabase');
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: '1', email: 'test@test.com' },
        },
      } as any,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({
            data: { id: '1', first_name: 'Test', last_name: 'User', role: 'admin', created_at: new Date().toISOString() },
            error: null,
          })),
        })),
      })),
    } as any);

    render(
      <AuthProvider>
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
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/admin secret/i)).toBeInTheDocument();
    });
  });

  it('ProtectedRoute redirects to role dashboard when role mismatches', async () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', role: 'client' }));
    localStorage.setItem('role', 'client');

    // Mock supabase to return a session
    const { supabase } = await import('@/lib/supabase');
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: '1', email: 'test@test.com' },
        },
      } as any,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({
            data: { id: '1', first_name: 'Test', last_name: 'User', role: 'client', created_at: new Date().toISOString() },
            error: null,
          })),
        })),
      })),
    } as any);

    render(
      <AuthProvider>
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
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/client dashboard/i)).toBeInTheDocument();
    });
  });

  it('PublicRoute redirects authenticated users to role dashboard', async () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', role: 'client' }));
    localStorage.setItem('role', 'client');

    // Mock supabase to return a session
    const { supabase } = await import('@/lib/supabase');
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: '1', email: 'test@test.com' },
        },
      } as any,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({
            data: { id: '1', first_name: 'Test', last_name: 'User', role: 'client', created_at: new Date().toISOString() },
            error: null,
          })),
        })),
      })),
    } as any);

    render(
      <AuthProvider>
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
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/client dashboard/i)).toBeInTheDocument();
    });
  });

  it('RoleBasedRoute blocks users without allowed role', async () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', role: 'client' }));
    localStorage.setItem('role', 'client');

    // Mock supabase to return a session
    const { supabase } = await import('@/lib/supabase');
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: '1', email: 'test@test.com' },
        },
      } as any,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({
            data: { id: '1', first_name: 'Test', last_name: 'User', role: 'client', created_at: new Date().toISOString() },
            error: null,
          })),
        })),
      })),
    } as any);

    render(
      <AuthProvider>
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
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/client dashboard/i)).toBeInTheDocument();
    });
  });

  it('ProtectedRoute component renders without crashing', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={<div>Login</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('PublicRoute component renders without crashing', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <div>Public Content</div>
                </PublicRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('RoleBasedRoute component renders without crashing', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Routes>
            <Route
              path="/"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'client']}>
                  <div>Role Protected</div>
                </RoleBasedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    expect(document.body).toBeInTheDocument();
  });
});


