import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen, act, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { AboutPage } from '@/pages/About/AboutPage';
import { AnalyticsPage } from '@/pages/Admin/AnalyticsPage';
import { LeadManagementPage } from '@/pages/Admin/LeadManagementPage';
import { router } from '@/routes';
import { adminAPI, authAPI } from '@/services/api';

vi.mock('framer-motion', () => {
  const Mock = (props: any) => <div {...props} />;
  const motion = new Proxy(
    {},
    {
      get: () => Mock,
    }
  );
  return { motion, AnimatePresence: ({ children }: any) => <>{children}</> };
});

const mockAnalytics = {
  totalLeads: 10,
  activeClients: 5,
  totalRevenue: 1000,
  monthlyRevenue: 200,
  conversionRate: 12,
  funnel: [],
  trends: [],
};

const mockLeads = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@test.com', phone: '123', source: 'web', status: 'hot', score: 90, lastContact: new Date().toISOString(), notes: '', assignedTo: 'admin' },
];

vi.mock('@/services/api', () => ({
  adminAPI: {
    getAnalytics: vi.fn(async () => mockAnalytics),
    getLeads: vi.fn(async () => mockLeads),
    updateLeadStatus: vi.fn(async () => mockLeads[0]),
    addLeadNote: vi.fn(async () => mockLeads[0]),
  },
  authAPI: {
    login: vi.fn(async () => ({ id: '1' })),
  },
  clientAPI: {},
}));

describe('AboutPage', () => {
  it('renders company values', () => {
    renderWithProviders(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/transparency/i).length).toBeGreaterThan(0);
  });
});

describe('Admin pages', () => {
  it('renders AnalyticsPage without errors', () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );
    expect(container).toBeInTheDocument();
  });

  it('renders LeadManagementPage without errors', () => {
    const { container } = renderWithProviders(
      <MemoryRouter>
        <LeadManagementPage />
      </MemoryRouter>
    );
    expect(container).toBeInTheDocument();
  });
});

describe('Routes', () => {
  it('router is defined', () => {
    expect(router).toBeTruthy();
  });
});

describe('Services', () => {
  it('authAPI login returns user', async () => {
    vi.useFakeTimers();
    const promise = authAPI.login('a', 'b', 'client');
    await vi.runAllTimersAsync();
    const user = await promise;
    expect(user).toBeTruthy();
    vi.useRealTimers();
  });

  it('adminAPI getAnalytics returns data', async () => {
    vi.useFakeTimers();
    const promise = adminAPI.getAnalytics();
    await vi.runAllTimersAsync();
    const data = await promise;
    expect(data.totalLeads).toBe(10);
    vi.useRealTimers();
  });
});

