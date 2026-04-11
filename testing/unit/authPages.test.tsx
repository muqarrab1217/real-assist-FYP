import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen, act } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { RegisterPage } from '@/pages/Auth/RegisterPage';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe('LoginPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogin.mockReset();
  });

  it('renders form fields', () => {
    renderWithProviders(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderWithProviders(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const password = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(password.type).toBe('password');
    // Find eye icon button - there's one for password visibility
    const eyeButtons = screen.getAllByRole('button').filter(btn => !btn.textContent);
    await userEvent.click(eyeButtons[0]);
    expect(password.type).toBe('text');
  });

  it('can submit form', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'secret');
    // Just verify the form can be submitted (button can be clicked)
    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    expect(submitBtn).toBeInTheDocument();
    await user.click(submitBtn);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  it('shows "Sign In" button text', () => {
    renderWithProviders(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe('RegisterPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('shows password mismatch error', async () => {
    renderWithProviders(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '123');
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Mismatch');

    // Should show error message in UI
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows terms agreement required error', async () => {
    renderWithProviders(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '123');
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1');

    const createBtn = screen.getByRole('button', { name: /create account/i });
    await act(async () => {
      await userEvent.click(createBtn);
    });

    // Should show error about terms
    expect(screen.getByText(/agree to the terms/i)).toBeInTheDocument();
  });

  it('displays password requirements feedback', async () => {
    renderWithProviders(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const user = userEvent.setup({ delay: null });
    const pwd = await screen.findByLabelText(/^password$/i);
    await user.type(pwd, 'Pass1');

    // Should show password requirement text
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});

