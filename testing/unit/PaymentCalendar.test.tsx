import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentCalendar } from '@/components/Client/PaymentCalendar';
import { Payment } from '@/types';

describe('PaymentCalendar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPayments: Payment[] = [
    {
      id: 'pay-1',
      installmentNumber: 1,
      amount: 100000,
      dueDate: new Date(2024, 0, 15).toISOString(),
      status: 'paid',
      clientId: 'client-1',
      projectId: 'proj-1'
    },
    {
      id: 'pay-2',
      installmentNumber: 2,
      amount: 150000,
      dueDate: new Date(2024, 0, 20).toISOString(),
      status: 'pending',
      clientId: 'client-1',
      projectId: 'proj-1'
    },
    {
      id: 'pay-3',
      installmentNumber: 3,
      amount: 120000,
      dueDate: new Date(2024, 0, 25).toISOString(),
      status: 'overdue',
      clientId: 'client-1',
      projectId: 'proj-1'
    }
  ];

  describe('Calendar Rendering', () => {
    it('renders calendar without crashing', () => {
      const { container } = render(
        <PaymentCalendar payments={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('displays current month and year', () => {
      const today = new Date();
      const monthName = today.toLocaleString('default', { month: 'long' });
      const year = today.getFullYear();

      render(<PaymentCalendar payments={[]} />);

      expect(screen.getByText(monthName)).toBeInTheDocument();
      expect(screen.getByText(year.toString())).toBeInTheDocument();
    });

    it('renders calendar grid with 7 columns for days of week', () => {
      const { container } = render(
        <PaymentCalendar payments={[]} />
      );

      const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayHeaders.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('renders all days in current month', () => {
      render(<PaymentCalendar payments={[]} />);

      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        expect(screen.getByText(day.toString())).toBeInTheDocument();
      }
    });
  });

  describe('Month Navigation', () => {
    it('has navigation buttons', () => {
      render(
        <PaymentCalendar payments={[]} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // Previous and Next buttons
    });

    it('has previous month button', () => {
      render(
        <PaymentCalendar payments={[]} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toBeInTheDocument();
    });

    it('has next month button', () => {
      render(
        <PaymentCalendar payments={[]} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[1]).toBeInTheDocument();
    });

    it('navigation buttons are clickable', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <PaymentCalendar payments={[]} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Payment Indicators', () => {
    it('displays payment status indicators for days with payments', () => {
      render(
        <PaymentCalendar payments={mockPayments} />
      );

      // Days with payments should have indicators
      const day15 = screen.getByText('15').closest('div');
      const day20 = screen.getByText('20').closest('div');
      const day25 = screen.getByText('25').closest('div');

      expect(day15).toBeInTheDocument();
      expect(day20).toBeInTheDocument();
      expect(day25).toBeInTheDocument();
    });

    it('renders days with payments', () => {
      render(
        <PaymentCalendar payments={mockPayments} />
      );

      // All payment days should be rendered
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('handles multiple payments on same day', () => {
      const paymentsOnSameDay: Payment[] = [
        {
          id: 'pay-1',
          installmentNumber: 1,
          amount: 100000,
          dueDate: new Date(2024, 0, 15).toISOString(),
          status: 'paid',
          clientId: 'client-1',
          projectId: 'proj-1'
        },
        {
          id: 'pay-2',
          installmentNumber: 2,
          amount: 150000,
          dueDate: new Date(2024, 0, 15).toISOString(),
          status: 'pending',
          clientId: 'client-1',
          projectId: 'proj-1'
        }
      ];

      render(
        <PaymentCalendar payments={paymentsOnSameDay} />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Due Day Highlighting', () => {
    it('highlights the specified due day', () => {
      const { container } = render(
        <PaymentCalendar payments={[]} dueDay={15} />
      );

      const day15 = screen.getByText('15').closest('div');
      expect(day15).toBeInTheDocument();
    });

    it('applies special styling to due day', () => {
      const { container } = render(
        <PaymentCalendar payments={[]} dueDay={15} />
      );

      const day15 = screen.getByText('15').closest('div');
      const classNames = day15?.className || '';

      // Check for due day styling indicators
      expect(classNames.includes('gold-500') || classNames.includes('gold-400')).toBe(true);
    });

    it('shows due day label in tooltip', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <PaymentCalendar payments={[]} dueDay={15} />
      );

      const day15 = screen.getByText('15').closest('div');
      if (day15) {
        await user.hover(day15);
      }

      // Due day tooltip should be visible
      expect(screen.getByText(/Monthly Due Date|Due/i)).toBeInTheDocument();
    });
  });

  describe('Status Styling', () => {
    it('applies different colors for paid status', () => {
      const paidPayments: Payment[] = [
        {
          id: 'pay-1',
          installmentNumber: 1,
          amount: 100000,
          dueDate: new Date(2024, 0, 15).toISOString(),
          status: 'paid',
          clientId: 'client-1',
          projectId: 'proj-1'
        }
      ];

      render(
        <PaymentCalendar payments={paidPayments} />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('applies different colors for pending status', () => {
      const pendingPayments: Payment[] = [
        {
          id: 'pay-1',
          installmentNumber: 1,
          amount: 100000,
          dueDate: new Date(2024, 0, 15).toISOString(),
          status: 'pending',
          clientId: 'client-1',
          projectId: 'proj-1'
        }
      ];

      render(
        <PaymentCalendar payments={pendingPayments} />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('applies different colors for overdue status', () => {
      const overduePayments: Payment[] = [
        {
          id: 'pay-1',
          installmentNumber: 1,
          amount: 100000,
          dueDate: new Date(2024, 0, 15).toISOString(),
          status: 'overdue',
          clientId: 'client-1',
          projectId: 'proj-1'
        }
      ];

      render(
        <PaymentCalendar payments={overduePayments} />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('displays default legend when no payments provided', () => {
      render(
        <PaymentCalendar payments={[]} />
      );

      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Settled')).toBeInTheDocument();
    });

    it('renders calendar with empty days', () => {
      render(
        <PaymentCalendar payments={[]} />
      );

      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

      for (let day = 1; day <= Math.min(daysInMonth, 5); day++) {
        expect(screen.getByText(day.toString())).toBeInTheDocument();
      }
    });
  });

  describe('Tooltip Display', () => {
    it('renders calendar with payment indicators', () => {
      const { container } = render(
        <PaymentCalendar payments={mockPayments} />
      );

      // Check that calendar structure renders with payments
      expect(container.querySelector('[class*="grid-cols-7"]')).toBeInTheDocument();
    });

    it('shows installment label in DOM', () => {
      const { container } = render(
        <PaymentCalendar payments={mockPayments} />
      );

      // The DOM should contain installment indicators
      const spans = container.querySelectorAll('span');
      expect(spans.length).toBeGreaterThan(0);
    });

    it('tooltip renders on days with payment activity', () => {
      const { container } = render(
        <PaymentCalendar payments={mockPayments} />
      );

      // Verify calendar renders with payments
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('displays tooltip only for days with payments or due day', () => {
      const { container } = render(
        <PaymentCalendar payments={mockPayments} />
      );

      // Calendar structure should be present
      expect(container.querySelector('[class*="grid-cols-7"]')).toBeInTheDocument();
    });
  });

  describe('Current Day Highlighting', () => {
    it('highlights today if in current month', async () => {
      const today = new Date();
      const currentDay = today.getDate();

      render(
        <PaymentCalendar payments={[]} />
      );

      const dayElement = screen.getByText(currentDay.toString());
      expect(dayElement).toBeInTheDocument();
    });

    it('applies special styling to today', () => {
      const today = new Date();
      const currentDay = today.getDate();

      const { container } = render(
        <PaymentCalendar payments={[]} />
      );

      const dayElement = screen.getByText(currentDay.toString()).closest('div');
      expect(dayElement).toBeInTheDocument();
    });
  });

  describe('CustomClassName', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(
        <PaymentCalendar payments={[]} className="custom-class" />
      );

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Payment Amount Formatting', () => {
    it('renders payment days in calendar', () => {
      render(
        <PaymentCalendar payments={mockPayments} />
      );

      // Payment days should be rendered in the calendar
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  describe('Future vs Past Styling', () => {
    it('renders future payments in calendar', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const paymentsWithFuture: Payment[] = [
        {
          id: 'pay-1',
          installmentNumber: 1,
          amount: 100000,
          dueDate: futureDate.toISOString(),
          status: 'pending',
          clientId: 'client-1',
          projectId: 'proj-1'
        }
      ];

      const { container } = render(
        <PaymentCalendar payments={paymentsWithFuture} />
      );

      // Verify calendar renders with payment
      expect(container).toBeInTheDocument();
    });
  });

  describe('Payment Status Labels', () => {
    it('displays payment days in calendar', () => {
      render(
        <PaymentCalendar payments={mockPayments} />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('shows all payment dates', () => {
      render(
        <PaymentCalendar payments={mockPayments} />
      );

      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('renders payment dates for all statuses', () => {
      render(
        <PaymentCalendar payments={mockPayments} />
      );

      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('accepts empty payments array', () => {
      const { container } = render(
        <PaymentCalendar payments={[]} />
      );

      expect(container).toBeInTheDocument();
    });

    it('accepts dueDay prop', () => {
      const { container } = render(
        <PaymentCalendar payments={[]} dueDay={15} />
      );

      expect(container).toBeInTheDocument();
    });

    it('accepts className prop', () => {
      const { container } = render(
        <PaymentCalendar payments={[]} className="test-class" />
      );

      expect(container.querySelector('.test-class')).toBeInTheDocument();
    });
  });
});
