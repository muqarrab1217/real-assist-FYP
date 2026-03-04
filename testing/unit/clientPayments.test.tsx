import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentsPage } from '@/pages/Client/PaymentsPage';

const mockPayments = [
  { id: 'C-P1', clientId: 'CL1', installmentNumber: 1, amount: 1000, status: 'paid', dueDate: '2024-01-01', paidDate: '2024-01-02', method: 'bank' },
  { id: 'C-P2', clientId: 'CL1', installmentNumber: 2, amount: 500, status: 'pending', dueDate: '2024-02-01', method: 'card' },
  { id: 'C-P3', clientId: 'CL1', installmentNumber: 3, amount: 750, status: 'overdue', dueDate: '2024-03-01', method: 'card' },
];

vi.mock('@/services/api', () => ({
  clientAPI: {
    getPayments: vi.fn(async () => mockPayments),
    makePayment: vi.fn(async () => ({})),
  },
}));

describe('Client PaymentsPage', () => {
  it('renders header and payment rows', async () => {
    render(
      <MemoryRouter>
        <PaymentsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/payment management/i)).toBeInTheDocument();
    expect(screen.getAllByText(/#\s*1/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/#\s*2/).length).toBeGreaterThan(0);
  });

  it('shows summary totals for paid and pending', async () => {
    render(
      <MemoryRouter>
        <PaymentsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/total paid/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\$1,000\.00/).length).toBeGreaterThan(0);
    expect(screen.getByText(/pending payments/i)).toBeInTheDocument();
  });

  it('filters by search term', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <PaymentsPage />
      </MemoryRouter>
    );

    const searchInput = await screen.findByPlaceholderText(/search/i);
    await user.type(searchInput, 'overdue');

    expect((searchInput as HTMLInputElement).value).toContain('overdue');
  }, 10000);
});

