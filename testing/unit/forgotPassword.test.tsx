import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordPage } from '@/pages/Auth/ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reset form', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('shows submitted state after sending', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'user@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await act(async () => {
      await user.click(submitButton);
    });

    const checkEmailElements = await screen.findAllByText(/check your email/i);
    expect(checkEmailElements.length).toBeGreaterThan(0);

    const backButton = await screen.findByRole('button', { name: /back to reset/i });
    await act(async () => {
      await user.click(backButton);
    });

    expect(await screen.findByText(/reset password/i)).toBeInTheDocument();
  }, 10000);

  it('email input accepts user input', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    await user.type(emailInput, 'test@example.com');

    expect(emailInput.value).toBe('test@example.com');
  });

  it('page renders without crashing', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(document.body).toBeInTheDocument();
  });

  it('contains send reset link button', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    const sendButton = screen.getByRole('button', { name: /send reset link/i });
    expect(sendButton).toBeInTheDocument();
  });

  it('form elements are properly labeled', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('has proper page structure', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });
});


