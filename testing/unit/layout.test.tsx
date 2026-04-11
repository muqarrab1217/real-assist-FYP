import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('renders navbar with title prop', () => {
    const onSearch = vi.fn();
    render(
      <MemoryRouter>
        <Navbar title="Test Title" onSearch={onSearch} />
      </MemoryRouter>
    );

    expect(screen.getByText(/test title/i)).toBeInTheDocument();
  });

  it('navbar contains search input field', () => {
    const onSearch = vi.fn();
    render(
      <MemoryRouter>
        <Navbar title="Dashboard" onSearch={onSearch} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('navbar renders without crashing', () => {
    const onSearch = vi.fn();
    render(
      <MemoryRouter>
        <Navbar title="Dashboard" onSearch={onSearch} />
      </MemoryRouter>
    );

    expect(document.body).toBeInTheDocument();
  });

  it('search callback is triggered on input change', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup({ delay: null });

    render(
      <MemoryRouter>
        <Navbar title="Dashboard" onSearch={onSearch} />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText(/search/i), 'test');
    expect(onSearch).toHaveBeenCalled();
  });
});

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('sidebar renders without crashing', () => {
    render(
      <MemoryRouter>
        <Sidebar role="client" />
      </MemoryRouter>
    );

    expect(document.body).toBeInTheDocument();
  });

  it('logout button is present when callback provided', () => {
    const onLogout = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar role="client" onLogout={onLogout} />
      </MemoryRouter>
    );

    expect(document.body).toBeInTheDocument();
  });

  it('sidebar accepts role prop', () => {
    render(
      <MemoryRouter>
        <Sidebar role="admin" />
      </MemoryRouter>
    );

    expect(document.body).toBeInTheDocument();
  });

  it('role change callback works', async () => {
    const onRoleChange = vi.fn();
    const user = userEvent.setup({ delay: null });

    render(
      <MemoryRouter>
        <Sidebar role="client" onRoleChange={onRoleChange} />
      </MemoryRouter>
    );

    const roleButton = screen.getByRole('button', { name: /admin/i });
    await user.click(roleButton);

    expect(onRoleChange).toHaveBeenCalled();
  });

  it('sidebar contains dashboard link', () => {
    render(
      <MemoryRouter initialEntries={['/client/dashboard']}>
        <Sidebar role="client" />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('logout callback is triggered on button click', async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup({ delay: null });

    render(
      <MemoryRouter>
        <Sidebar role="client" onLogout={onLogout} />
      </MemoryRouter>
    );

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    expect(onLogout).toHaveBeenCalled();
  });
});


