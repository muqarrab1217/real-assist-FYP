import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
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
  it('shows loader then renders stats', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/admin dashboard/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/leads/i)).length).toBeGreaterThan(0);
    expect(screen.getByText('$250k')).toBeInTheDocument();
  });

  it('renders recent top leads list', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/top leads/i)).toBeInTheDocument();
    expect(screen.getAllByText(/sarah johnson/i).length).toBeGreaterThan(0);
  });
});

describe('ClientDashboard', () => {
  it('shows loader then renders client stats', async () => {
    render(
      <MemoryRouter>
        <ClientDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
    expect(await screen.findByText(/\$50k/i)).toBeInTheDocument();
    expect(screen.getByText(/returns/i)).toBeInTheDocument();
  });

  it('shows quick action buttons', async () => {
    render(
      <MemoryRouter>
        <ClientDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/quick actions/i)).toBeInTheDocument();
    expect(screen.getByText(/make payment/i)).toBeInTheDocument();
    expect(screen.getByText(/view ledger/i)).toBeInTheDocument();
  });
});

describe('PaymentsManagementPage', () => {
  it('shows loader then payment stats and rows', async () => {
    render(
      <MemoryRouter>
        <PaymentsManagementPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/payments & ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/total payments/i)).toBeInTheDocument();
    expect(screen.getByText(/p1/i)).toBeInTheDocument();
    expect(screen.getByText(/p2/i)).toBeInTheDocument();
  });

  it('filters by status', async () => {
    render(
      <MemoryRouter>
        <PaymentsManagementPage />
      </MemoryRouter>
    );

    await screen.findByText(/payments & ledger/i);
    await userEvent.selectOptions(screen.getByDisplayValue(/all status/i), 'paid');

    expect(screen.getByText(/p1/i)).toBeInTheDocument();
    expect(screen.queryByText(/p2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/p3/i)).not.toBeInTheDocument();
  });

  it('filters by overdue status', async () => {
    render(
      <MemoryRouter>
        <PaymentsManagementPage />
      </MemoryRouter>
    );

    await screen.findByText(/payments & ledger/i);
    await userEvent.selectOptions(screen.getByDisplayValue(/all status/i), 'overdue');

    expect(screen.getByText(/p3/i)).toBeInTheDocument();
    expect(screen.queryByText(/p1/i)).not.toBeInTheDocument();
  });

  it('searches by id', async () => {
    render(
      <MemoryRouter>
        <PaymentsManagementPage />
      </MemoryRouter>
    );

    await screen.findByText(/payments & ledger/i);
    await userEvent.type(screen.getByPlaceholderText(/search payments by id or client id/i), 'P2');

    expect(screen.getByText(/p2/i)).toBeInTheDocument();
    expect(screen.queryByText(/p1/i)).not.toBeInTheDocument();
  });

  it('exports data', async () => {
    render(
      <MemoryRouter>
        <PaymentsManagementPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/payments & ledger/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
  });

  it('shows status-specific rows', async () => {
    render(
      <MemoryRouter>
        <PaymentsManagementPage />
      </MemoryRouter>
    );

    await screen.findByText(/payments & ledger/i);
    const transactionHeaders = await screen.findAllByText(/payment transactions/i);
    expect(transactionHeaders.length).toBeGreaterThan(0);
    const overdueElements = await screen.findAllByText(/overdue/i);
    expect(overdueElements.length).toBeGreaterThan(0);
  });
});

