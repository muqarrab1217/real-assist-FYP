import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen, act, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { AdminDashboard } from '@/pages/Admin/AdminDashboard';
import { ClientDashboard } from '@/pages/Client/ClientDashboard';
import { PaymentsManagementPage } from '@/pages/Admin/PaymentsManagementPage';

const mockAdminStats = [
  { title: 'Leads', value: '120', change: 12, changeType: 'increase', icon: 'UsersIcon' },
  { title: 'Revenue', value: '$250k', change: -5, changeType: 'decrease', icon: 'CurrencyDollarIcon' },
];

const mockClientStats = [
  { title: 'Invested', value: '$50k', change: 4, changeType: 'increase', icon: 'CurrencyDollarIcon' },
  { title: 'Returns', value: '$5k', change: 2, changeType: 'increase', icon: 'CheckCircleIcon' },
];

const mockPayments = [
  { id: 'P1', clientId: 'C1', installmentNumber: 1, amount: 1000, status: 'paid', dueDate: '2024-01-01', paidDate: '2024-01-02', method: 'bank' },
  { id: 'P2', clientId: 'C2', installmentNumber: 2, amount: 500, status: 'pending', dueDate: '2024-02-01', method: 'card' },
  { id: 'P3', clientId: 'C3', installmentNumber: 3, amount: 750, status: 'overdue', dueDate: '2024-02-10', method: 'card' },
];

vi.mock('@/services/api', () => ({
  adminAPI: {
    getDashboardStats: vi.fn(async () => mockAdminStats),
    getPayments: vi.fn(async () => mockPayments),
    exportData: vi.fn(async () => new Blob()),
  },
  clientAPI: {
    getDashboardStats: vi.fn(async () => mockClientStats),
  },
}));

describe('AdminDashboard', () => {
  it('renders without errors', async () => {
    renderWithProviders(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/admin dashboard/i)).toBeInTheDocument();
  });

  it('renders leads section', async () => {
    renderWithProviders(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/top leads/i)).toBeInTheDocument();
  });
});

describe('ClientDashboard', () => {
  it('renders client dashboard', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ClientDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
  });

  it('renders dashboard content', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ClientDashboard />
      </MemoryRouter>
    );

    await screen.findByText(/welcome back/i);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});

describe('PaymentsManagementPage', () => {
  it('renders payments page header', async () => {
    renderWithProviders(
      <MemoryRouter>
        <PaymentsManagementPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/payments & ledger/i)).toBeInTheDocument();
  });

  it('renders search functionality', async () => {
    renderWithProviders(
      <MemoryRouter>
        <PaymentsManagementPage />
      </MemoryRouter>
    );

    await screen.findByText(/payments & ledger/i);
    expect(screen.getByPlaceholderText(/search payments by id or client id/i)).toBeInTheDocument();
  });

  it('renders page content', async () => {
    renderWithProviders(
      <MemoryRouter>
        <PaymentsManagementPage />
      </MemoryRouter>
    );

    await screen.findByText(/payments & ledger/i);
    expect(screen.getByText(/payments & ledger/i)).toBeInTheDocument();
  });
});
