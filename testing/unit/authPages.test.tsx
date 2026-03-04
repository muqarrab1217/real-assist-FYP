import { MemoryRouter } from 'react-router-dom';
import { render, screen, act } from '@testing-library/react';
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

  it('renders form fields and defaults to client role', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/account type/i)).toHaveDisplayValue(/client/i);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const password = screen.getByLabelText(/password/i);
    expect(password).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: '' })); // eye icon button has no text
    expect(password).toHaveAttribute('type', 'text');
  });

  it('submits and navigates to client dashboard', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await vi.runAllTimersAsync();

    expect(mockLogin).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/client/dashboard', { replace: true });
    vi.useRealTimers();
  });

  it('submits as admin when selected', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.selectOptions(screen.getByLabelText(/account type/i), 'admin');
    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await vi.runAllTimersAsync();

    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
    vi.useRealTimers();
  });
});

describe('RegisterPage', () => {
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    mockNavigate.mockReset();
    alertSpy.mockClear();
  });

  it('requires matching passwords', async () => {
    render(
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
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(alertSpy).toHaveBeenCalledWith('Passwords do not match');
  });

  it('requires agreeing to terms', async () => {
    render(
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
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(alertSpy).toHaveBeenCalledWith('Please agree to the terms and conditions');
  });

  it('navigates to dashboard on success', async () => {
    render(
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
    await user.click(screen.getByLabelText(/agree to the/i));

    const createBtn = await screen.findByRole('button', { name: /create account/i });
    await act(async () => {
      await userEvent.click(createBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/client/dashboard');
  }, 15000);

  it('shows password requirements feedback', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const user = userEvent.setup({ delay: null });
    const pwd = await screen.findByLabelText(/^password$/i);
    await user.type(pwd, 'Pass1word');
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  }, 10000);
});

