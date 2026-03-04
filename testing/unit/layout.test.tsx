import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

describe('Navbar', () => {
  it('shows title and triggers search input changes', async () => {
    const onSearch = vi.fn();

    render(
      <MemoryRouter>
        <Navbar
          title="Dashboard"
          onSearch={onSearch}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/search/i), 'abc');
    expect(onSearch).toHaveBeenCalledWith('a');
    expect(onSearch).toHaveBeenCalledWith('ab');
    expect(onSearch).toHaveBeenCalledWith('abc');
  });
});

describe('Sidebar', () => {
  it('renders client navigation and allows role switch and logout', async () => {
    const onRoleChange = vi.fn();
    const onLogout = vi.fn();

    render(
      <MemoryRouter initialEntries={['/client/payments']}>
        <Sidebar role="client" onRoleChange={onRoleChange} onLogout={onLogout} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/client/dashboard'
    );
    expect(screen.getByRole('link', { name: /payments/i })).toHaveAttribute(
      'href',
      '/client/payments'
    );

    await userEvent.click(screen.getByRole('button', { name: /admin/i }));
    expect(onRoleChange).toHaveBeenCalledWith('admin');

    await userEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('renders support links', () => {
    render(
      <MemoryRouter>
        <Sidebar role="client" />
      </MemoryRouter>
    );

    expect(screen.getByText(/get help/i)).toBeInTheDocument();
    expect(screen.getByText(/submit feedback/i)).toBeInTheDocument();
  });
});

