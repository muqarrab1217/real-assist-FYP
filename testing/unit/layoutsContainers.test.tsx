import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthProvider } from '@/contexts/AuthContext';

vi.mock('@/components/ui/Chatbot', () => ({
  Chatbot: () => <div>Chatbot</div>,
}));

vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => <div>Sidebar</div>,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn(),
    isAuthenticated: true,
    user: null,
    loading: false,
    role: 'client',
    login: vi.fn(),
    hasRole: vi.fn(() => true),
    hasAnyRole: vi.fn(() => true),
  }),
}));

describe('Layouts smoke render', () => {
  it('renders AuthLayout children', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/auth" element={<div>Auth Child</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Auth Child/i)).toBeInTheDocument();
  });

  it('renders PublicLayout children', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/public']}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/public" element={<div>Public Child</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Public Child/i)).toBeInTheDocument();
    expect(screen.getByText(/Chatbot/i)).toBeInTheDocument();
  });

  it('renders DashboardLayout with sidebar and outlet', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dash']}>
          <Routes>
            <Route element={<DashboardLayout role="client" title="Dash" />}>
              <Route path="/dash" element={<div>Dashboard Child</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Dashboard Child/i)).toBeInTheDocument();
    expect(screen.getByText(/Sidebar/i)).toBeInTheDocument();
  });
});

